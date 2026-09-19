import io
from typing import List, Tuple, Union
import numpy as np
import scipy.signal
import soundfile as sf
import librosa


class AudioCleaner:
    """
    CardioSense Digital Signal Processing (DSP) Pipeline:
    - Standardizes heart sound audio to 2,000 Hz (Nyquist 1,000 Hz covers all fundamental PCG bandwidth).
    - Applies a 4th-order Butterworth bandpass filter (20 Hz to 200 Hz) to eliminate ambient noise,
      speech, sensor friction, and baseline drift.
    - Zero-phase filtering via filtfilt ensures temporal integrity of S1, S2, S3, S4 heart sounds.
    - Normalizes amplitude to [-1.0, 1.0].
    - Segments audio into fixed-length windows with configurable overlap.
    """

    def __init__(
        self,
        target_sr: int = 2000,
        lowcut: float = 20.0,
        highcut: float = 200.0,
        filter_order: int = 4,
        window_duration: float = 4.0,
        hop_duration: float = 2.0,
    ):
        self.target_sr = target_sr
        self.lowcut = lowcut
        self.highcut = highcut
        self.filter_order = filter_order
        self.window_duration = window_duration
        self.hop_duration = hop_duration
        self.window_samples = int(window_duration * target_sr)
        self.hop_samples = int(hop_duration * target_sr)

    def load_audio(self, audio_source: Union[str, bytes, io.BytesIO]) -> Tuple[np.ndarray, int]:
        """
        Loads audio from a file path, raw bytes, or BytesIO buffer.
        Converts multi-channel to mono and resamples to target_sr.
        """
        if isinstance(audio_source, (bytes, io.BytesIO)):
            if isinstance(audio_source, bytes):
                audio_source = io.BytesIO(audio_source)
            y, orig_sr = sf.read(audio_source)
        else:
            y, orig_sr = sf.read(audio_source)

        # Convert stereo / multi-channel to mono
        if y.ndim > 1:
            y = np.mean(y, axis=1)

        # Resample if original sample rate doesn't match target
        if orig_sr != self.target_sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=self.target_sr)

        return y.astype(np.float32), self.target_sr

    def butter_bandpass_filter(self, data: np.ndarray) -> np.ndarray:
        """
        Applies a zero-phase 4th-order Butterworth bandpass filter (20 - 200 Hz).
        """
        nyq = 0.5 * self.target_sr
        low = self.lowcut / nyq
        high = self.highcut / nyq

        # Ensure frequencies are within valid normalized bounds (0, 1)
        low = max(0.001, min(low, 0.99))
        high = max(low + 0.01, min(high, 0.999))

        b, a = scipy.signal.butter(self.filter_order, [low, high], btype="bandpass")
        # filtfilt applies filter forwards and backwards to eliminate phase distortion
        filtered_data = scipy.signal.filtfilt(b, a, data)
        return filtered_data.astype(np.float32)

    def normalize(self, data: np.ndarray) -> np.ndarray:
        """
        Normalizes waveform amplitude to [-1.0, 1.0] while preventing divide-by-zero on silence.
        """
        max_val = np.max(np.abs(data))
        if max_val > 1e-6:
            return (data / max_val).astype(np.float32)
        return data.astype(np.float32)

    def process(self, audio_source: Union[str, bytes, io.BytesIO]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Full DSP Pipeline: Load -> Resample -> Bandpass Filter -> Normalize.
        Returns:
            raw_audio: Resampled original signal (for visual comparisons).
            cleaned_audio: Bandpass-filtered & normalized signal.
        """
        raw_audio, _ = self.load_audio(audio_source)
        filtered = self.butter_bandpass_filter(raw_audio)
        cleaned_audio = self.normalize(filtered)
        return raw_audio, cleaned_audio

    def segment_audio(self, audio: np.ndarray) -> List[np.ndarray]:
        """
        Splits an audio array into fixed-length windows (e.g., 4s / 8000 samples).
        Pads the final segment with zeros if shorter than window_samples.
        """
        total_samples = len(audio)
        if total_samples <= self.window_samples:
            # Pad with zeros if recording is shorter than 1 window
            padded = np.pad(audio, (0, self.window_samples - total_samples), mode="constant")
            return [padded]

        segments = []
        start = 0
        while start < total_samples:
            end = start + self.window_samples
            if end <= total_samples:
                segments.append(audio[start:end])
            else:
                # Remaining tail segment: pad to full window
                tail = audio[start:total_samples]
                padded_tail = np.pad(tail, (0, self.window_samples - len(tail)), mode="constant")
                segments.append(padded_tail)
                break
            start += self.hop_samples

        return segments
