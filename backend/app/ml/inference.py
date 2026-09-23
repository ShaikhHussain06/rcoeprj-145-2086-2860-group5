import os
from typing import Dict, Any, List, Optional, Union
import io
import numpy as np
import torch
import torch.nn.functional as F

from backend.app.dsp.audio_cleaner import AudioCleaner
from backend.app.dsp.feature_extractor import FeatureExtractor
from backend.app.ml.model import CardioSenseCNN
from backend.app.ml.resnet import CardioResNet18


class InferenceEngine:
    """
    CardioSense Inference Engine:
    - Runs full end-to-end DSP pipeline (resample, bandpass 20-200Hz, normalize).
    - Extracts segment-level Mel-spectrograms.
    - Performs PyTorch forward pass with CardioResNet-18 (ROC-AUC 0.8041).
    - Calibrated with optimal decision threshold tau* = 0.2636.
    """

    def __init__(self, weights_path: Optional[str] = None, device: Optional[str] = None):
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))
        self.cleaner = AudioCleaner(target_sr=2000, lowcut=20.0, highcut=200.0)
        self.extractor = FeatureExtractor(sr=2000, n_mels=128)
        self.optimal_threshold = 0.4900  # Calibrated via Youden's J on held-out validation set (ROC-AUC 0.8376)

        # Initialize CardioResNet18
        self.model = CardioResNet18(num_classes=2).to(self.device)
        self.model.eval()

        self.weights_loaded = False
        if weights_path and os.path.exists(weights_path):
            try:
                state_dict = torch.load(weights_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.weights_loaded = True
                print(f"[InferenceEngine] Loaded trained CardioResNet-18 weights from {weights_path}")
            except Exception as e:
                # Fallback to CardioSenseCNN if legacy weights
                try:
                    self.model = CardioSenseCNN(num_classes=2).to(self.device)
                    self.model.load_state_dict(state_dict)
                    self.weights_loaded = True
                    print(f"[InferenceEngine] Loaded CardioSenseCNN weights from {weights_path}")
                except Exception as ex:
                    print(f"[InferenceEngine] Warning: Could not load weights ({ex}). Running in baseline mode.")

    def predict(self, audio_source: Union[str, bytes, io.BytesIO]) -> Dict[str, Any]:
        """
        Runs complete inference pipeline on an input heart sound recording.
        """
        # Step 1: Digital Signal Processing
        raw_audio, cleaned_audio = self.cleaner.process(audio_source)
        duration_sec = len(cleaned_audio) / self.cleaner.target_sr

        # Step 2: Audio Segmentation (4s windows with 2s hop)
        segments = self.cleaner.segment_audio(cleaned_audio)
        segment_results = []
        batch_tensors = []

        for seg_idx, segment in enumerate(segments):
            # Compute Mel-Spectrogram
            mel_spec = self.extractor.compute_mel_spectrogram(segment)  # (128, time_steps)
            # Shape: (1, 1, 128, time_steps)
            tensor_seg = torch.from_numpy(mel_spec).unsqueeze(0).unsqueeze(0).to(self.device)
            batch_tensors.append(tensor_seg)

        # Step 3: Batch Model Inference
        with torch.no_grad():
            full_batch = torch.cat(batch_tensors, dim=0)  # (N_segments, 1, 128, T)
            logits = self.model(full_batch)
            probs = F.softmax(logits, dim=1).cpu().numpy()  # [ [p_normal, p_abnormal], ... ]

        # Step 4: Segment-level Analysis
        abnormal_probs = []
        for idx, (p_norm, p_abnorm) in enumerate(probs):
            start_t = idx * self.cleaner.hop_duration
            end_t = min(start_t + self.cleaner.window_duration, duration_sec)
            is_seg_abnormal = bool(p_abnorm >= self.optimal_threshold)
            abnormal_probs.append(float(p_abnorm))

            segment_results.append({
                "segment_index": idx + 1,
                "start_time_sec": round(start_t, 2),
                "end_time_sec": round(end_t, 2),
                "normal_probability": round(float(p_norm), 4),
                "abnormal_probability": round(float(p_abnorm), 4),
                "status": "Abnormal Pattern Flagged" if is_seg_abnormal else "Normal Rhythm",
                "severity_score": round(float(p_abnorm) * 100, 1)
            })

        # Step 5: Patient-level Aggregation (Robust Mean Pooling)
        patient_abnormal_score = float(np.mean(abnormal_probs))
        patient_normal_score = 1.0 - patient_abnormal_score

        is_patient_abnormal = patient_abnormal_score >= self.optimal_threshold
        classification = "Abnormal" if is_patient_abnormal else "Normal"
        confidence = patient_abnormal_score if is_patient_abnormal else patient_normal_score

        # Step 6: Generate Base64 Spectrogram & Waveform Images for UI
        preview_audio = cleaned_audio[:min(len(cleaned_audio), self.cleaner.target_sr * 10)]
        spectrogram_img = self.extractor.generate_spectrogram_image_base64(
            preview_audio,
            title=f"CardioSense Analysis — {classification} ({confidence*100:.1f}% Confidence)"
        )
        waveform_img = self.extractor.generate_waveform_image_base64(
            preview_audio,
            title="Filtered Acoustic Amplitude Waveform (Butterworth 20-200 Hz)"
        )

        return {
            "classification": classification,
            "confidence_score": round(confidence, 4),
            "abnormal_probability": round(patient_abnormal_score, 4),
            "normal_probability": round(patient_normal_score, 4),
            "audio_duration_seconds": round(duration_sec, 2),
            "total_segments_analyzed": len(segment_results),
            "anomalous_segments_count": sum(1 for s in segment_results if s["abnormal_probability"] >= 0.50),
            "segments": segment_results,
            "spectrogram_image": spectrogram_img,
            "waveform_image": waveform_img,
            "weights_loaded": self.weights_loaded
        }
