import os
from typing import List, Tuple, Dict, Optional, Any, Set
import csv
import numpy as np
import soundfile as sf
import torch
from torch.utils.data import Dataset

from backend.app.dsp.audio_cleaner import AudioCleaner
from backend.app.dsp.feature_extractor import FeatureExtractor


class PhysioNetHeartSoundDataset(Dataset):
    """
    PhysioNet 2016 Heart Sound Dataset Loader with ZERO DATA LEAKAGE.
    - Explicitly excludes validation file IDs when loading training data.
    - Ensures 100% mutual exclusivity between train and validation sets.
    """

    def __init__(
        self,
        data_dirs: List[str],
        augment_mode: str = "none",
        exclude_ids: Optional[Set[str]] = None,
        target_sr: int = 2000,
        segment_duration: float = 4.0,
        cache_spectrograms: bool = True,
    ):
        self.augment_mode = augment_mode
        self.cleaner = AudioCleaner(target_sr=target_sr, window_duration=segment_duration)
        self.extractor = FeatureExtractor(sr=target_sr, n_mels=128)
        self.cache_spectrograms = cache_spectrograms
        self.samples: List[Dict[str, Any]] = []
        self._cache: Dict[int, np.ndarray] = {}

        self._load_metadata(data_dirs, exclude_ids=exclude_ids or set())

    def _load_metadata(self, data_dirs: List[str], exclude_ids: Set[str]):
        for d in data_dirs:
            if not os.path.exists(d):
                continue

            ref_file = None
            for candidate in ["REFERENCE.csv", "REFERENCE-v.csv", "reference.csv"]:
                p = os.path.join(d, candidate)
                if os.path.exists(p):
                    ref_file = p
                    break

            if not ref_file:
                continue

            with open(ref_file, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                for row in reader:
                    if not row or len(row) < 2:
                        continue
                    file_id = row[0].strip()
                    label_str = row[1].strip()

                    # Strictly exclude validation patient files if loading training set
                    if file_id in exclude_ids:
                        continue

                    try:
                        raw_label = int(label_str)
                        label = 0 if raw_label == -1 else (1 if raw_label == 1 else None)
                        if label is None:
                            continue
                    except ValueError:
                        continue

                    wav_path = os.path.join(d, f"{file_id}.wav")
                    if os.path.exists(wav_path):
                        self.samples.append({
                            "wav_path": wav_path,
                            "file_id": file_id,
                            "label": label,
                            "source_dir": os.path.basename(d)
                        })

        print(f"[Dataset] Loaded {len(self.samples)} recordings (Excluded: {len(exclude_ids)}). Distribution: "
              f"Normal={sum(1 for s in self.samples if s['label'] == 0)}, "
              f"Abnormal={sum(1 for s in self.samples if s['label'] == 1)}", flush=True)

    def get_smoothed_class_weights(self) -> torch.Tensor:
        labels = [s["label"] for s in self.samples]
        n_normal = sum(1 for l in labels if l == 0)
        n_abnormal = sum(1 for l in labels if l == 1)
        total = len(labels)
        w_normal = np.sqrt(total / (2.0 * n_normal))
        w_abnormal = np.sqrt(total / (2.0 * n_abnormal))
        mean_w = (w_normal + w_abnormal) / 2.0
        return torch.tensor([w_normal / mean_w, w_abnormal / mean_w], dtype=torch.float32)

    def apply_spec_augment(self, mel_spec: np.ndarray, max_time_mask: int = 4, max_freq_mask: int = 8) -> np.ndarray:
        augmented = mel_spec.copy()
        n_mels, time_steps = augmented.shape
        f_len = np.random.randint(0, max_freq_mask)
        f_start = np.random.randint(0, n_mels - f_len)
        augmented[f_start:f_start + f_len, :] = 0.0
        t_len = np.random.randint(0, max_time_mask)
        t_start = np.random.randint(0, time_steps - t_len)
        augmented[:, t_start:t_start + t_len] = 0.0
        return augmented

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, str]:
        sample = self.samples[idx]

        if self.augment_mode == "none" and self.cache_spectrograms and idx in self._cache:
            mel_spec = self._cache[idx]
        else:
            try:
                _, cleaned = self.cleaner.process(sample["wav_path"])
                segments = self.cleaner.segment_audio(cleaned)

                if self.augment_mode != "none" and len(segments) > 1:
                    seg = segments[np.random.randint(0, len(segments))]
                else:
                    seg = segments[0]

                mel_spec = self.extractor.compute_mel_spectrogram(seg)

                if self.augment_mode == "mild_specaugment":
                    if np.random.rand() > 0.50:
                        mel_spec = self.apply_spec_augment(mel_spec, max_time_mask=3, max_freq_mask=6)
                elif self.augment_mode == "specaugment":
                    if np.random.rand() > 0.40:
                        mel_spec = self.apply_spec_augment(mel_spec, max_time_mask=6, max_freq_mask=12)
                elif self.cache_spectrograms:
                    self._cache[idx] = mel_spec

            except Exception:
                mel_spec = np.zeros((128, 63), dtype=np.float32)

        tensor_spec = torch.from_numpy(mel_spec).unsqueeze(0)
        return tensor_spec, sample["label"], sample["file_id"]
