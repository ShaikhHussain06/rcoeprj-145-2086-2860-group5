import numpy as np
import pytest

from backend.app.dsp.audio_cleaner import AudioCleaner
from backend.app.dsp.feature_extractor import FeatureExtractor


def test_audio_cleaner_filtering():
    """
    Test that the Butterworth bandpass filter suppresses 10 Hz (low drift)
    and 1000 Hz (high frequency noise) while preserving 100 Hz (heart sound bandwidth).
    """
    sr = 2000
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)

    # 10 Hz low frequency (should be heavily attenuated)
    sig_10hz = np.sin(2 * np.pi * 10 * t)
    # 100 Hz cardiac fundamental frequency (should pass through)
    sig_100hz = np.sin(2 * np.pi * 100 * t)
    # 800 Hz high frequency noise (should be heavily attenuated)
    sig_800hz = np.sin(2 * np.pi * 800 * t)

    cleaner = AudioCleaner(target_sr=sr, lowcut=20.0, highcut=200.0)

    # Filter each signal
    filt_10hz = cleaner.butter_bandpass_filter(sig_10hz)
    filt_100hz = cleaner.butter_bandpass_filter(sig_100hz)
    filt_800hz = cleaner.butter_bandpass_filter(sig_800hz)

    rms_10hz_filt = np.sqrt(np.mean(filt_10hz ** 2))
    rms_100hz_filt = np.sqrt(np.mean(filt_100hz ** 2))
    rms_800hz_filt = np.sqrt(np.mean(filt_800hz ** 2))

    # 100Hz should have significantly higher energy than 10Hz and 800Hz
    assert rms_100hz_filt > 3 * rms_10hz_filt
    assert rms_100hz_filt > 3 * rms_800hz_filt


def test_audio_segmentation():
    """
    Test that audio segmenting correctly cuts signals into 4s windows with proper hop size.
    """
    sr = 2000
    cleaner = AudioCleaner(target_sr=sr, window_duration=4.0, hop_duration=2.0)

    # 10-second signal
    audio_10s = np.sin(2 * np.pi * 50 * np.linspace(0, 10, sr * 10, endpoint=False))
    segments = cleaner.segment_audio(audio_10s)

    # 10s audio with 4s window and 2s hop -> 0-4, 2-6, 4-8, 6-10, 8-10 (5 segments with tail)
    assert len(segments) == 5
    for seg in segments:
        assert len(seg) == 4 * sr  # 8000 samples


def test_feature_extractor_shape():
    """
    Test that Mel-Spectrogram extraction outputs proper (128, T) shape and Base64 format.
    """
    sr = 2000
    extractor = FeatureExtractor(sr=sr, n_mels=128)
    dummy_audio = np.random.randn(sr * 4).astype(np.float32)

    mel_spec = extractor.compute_mel_spectrogram(dummy_audio)
    assert mel_spec.shape[0] == 128
    assert mel_spec.ndim == 2

    # Test base64 image generation
    img_b64 = extractor.generate_spectrogram_image_base64(dummy_audio)
    assert img_b64.startswith("data:image/png;base64,")
