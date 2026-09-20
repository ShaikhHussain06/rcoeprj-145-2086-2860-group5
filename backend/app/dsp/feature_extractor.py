import base64
import io
from typing import Tuple
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server-side image rendering
import matplotlib.pyplot as plt
import numpy as np
import librosa


class FeatureExtractor:
    """
    Transforms filtered PCG audio signals into Log-Mel Spectrogram representations
    suitable for 2D Convolutional Neural Network (CNN) input and browser visualization.
    """

    def __init__(
        self,
        sr: int = 2000,
        n_mels: int = 128,
        n_fft: int = 512,
        hop_length: int = 128,
        fmin: float = 20.0,
        fmax: float = 400.0,
    ):
        self.sr = sr
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.fmin = fmin
        self.fmax = fmax

    def compute_mel_spectrogram(self, audio_segment: np.ndarray) -> np.ndarray:
        """
        Computes the Log Mel-Spectrogram of a 1D audio array.
        Returns a 2D numpy array of shape (n_mels, time_steps) with values in dB.
        """
        mel_spec = librosa.feature.melspectrogram(
            y=audio_segment,
            sr=self.sr,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            n_mels=self.n_mels,
            fmin=self.fmin,
            fmax=self.fmax,
            power=2.0,
        )
        # Convert power to decibel scale
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)

        # Standardize range to [-1.0, 1.0] for stable neural network training & inference
        min_val = np.min(log_mel_spec)
        max_val = np.max(log_mel_spec)
        if max_val - min_val > 1e-6:
            norm_spec = 2.0 * (log_mel_spec - min_val) / (max_val - min_val) - 1.0
        else:
            norm_spec = np.zeros_like(log_mel_spec)

        return norm_spec.astype(np.float32)

    def generate_spectrogram_image_base64(
        self,
        audio_segment: np.ndarray,
        title: str = "CardioSense Mel-Spectrogram (20-400 Hz)",
    ) -> str:
        """
        Renders a high-resolution dark-mode spectrogram image and returns it as a Base64-encoded PNG string.
        """
        mel_spec = librosa.feature.melspectrogram(
            y=audio_segment,
            sr=self.sr,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
            n_mels=self.n_mels,
            fmin=self.fmin,
            fmax=self.fmax,
        )
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)

        fig, ax = plt.subplots(figsize=(8, 3.2), dpi=100)
        fig.patch.set_facecolor("#0b0f19")
        ax.set_facecolor("#0b0f19")

        img = librosa.display.specshow(
            log_mel_spec,
            sr=self.sr,
            hop_length=self.hop_length,
            x_axis="time",
            y_axis="mel",
            fmin=self.fmin,
            fmax=self.fmax,
            cmap="inferno",
            ax=ax,
        )

        ax.set_title(title, color="#e2e8f0", fontsize=11, fontweight="bold", pad=10)
        ax.set_xlabel("Time (s)", color="#94a3b8", fontsize=9)
        ax.set_ylabel("Frequency (Hz)", color="#94a3b8", fontsize=9)
        ax.tick_params(colors="#94a3b8", labelsize=8)

        # Colorbar
        cbar = fig.colorbar(img, ax=ax, format="%+2.0f dB")
        cbar.ax.yaxis.set_tick_params(color="#94a3b8")
        plt.setp(plt.getp(cbar.ax.axes, "yticklabels"), color="#94a3b8", size=8)

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
        plt.close(fig)
        buf.seek(0)
        encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

    def generate_waveform_image_base64(
        self,
        audio_segment: np.ndarray,
        title: str = "Filtered Acoustic Amplitude Waveform (Butterworth 20-200 Hz)",
    ) -> str:
        """
        Renders a high-resolution dark-mode waveform plot and returns it as a Base64-encoded PNG string.
        """
        fig, ax = plt.subplots(figsize=(8, 2.2), dpi=100)
        fig.patch.set_facecolor("#0b0f19")
        ax.set_facecolor("#0b0f19")
        dur = len(audio_segment) / self.sr
        t_axis = np.linspace(0, dur, len(audio_segment))
        ax.plot(t_axis, audio_segment, color="#38bdf8", linewidth=1.1)
        ax.set_title(title, color="#e2e8f0", fontsize=10, fontweight="bold", pad=8)
        ax.set_xlabel("Time (s)", color="#94a3b8", fontsize=8)
        ax.set_ylabel("Amplitude", color="#94a3b8", fontsize=8)
        ax.tick_params(colors="#94a3b8", labelsize=8)
        ax.grid(True, color="#1e293b", linestyle="--", alpha=0.6)
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
        plt.close(fig)
        buf.seek(0)
        encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

