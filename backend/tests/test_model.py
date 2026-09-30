import torch
import pytest

from backend.app.ml.model import CardioSenseCNN


def test_cardiosense_cnn_forward():
    """
    Test that CardioSenseCNN processes (Batch, 1, 128, Time) tensors
    and outputs valid binary logits (Batch, 2).
    """
    batch_size = 4
    n_mels = 128
    time_steps = 63  # 4 seconds at sr=2000, hop=128

    dummy_input = torch.randn(batch_size, 1, n_mels, time_steps)
    model = CardioSenseCNN(num_classes=2)
    model.eval()

    with torch.no_grad():
        output = model(dummy_input)

    assert output.shape == (batch_size, 2)
    assert not torch.isnan(output).any()


def test_cardiosense_cnn_variable_length():
    """
    Test that AdaptiveAvgPool2d handles variable-length time steps gracefully.
    """
    model = CardioSenseCNN(num_classes=2)
    model.eval()

    # Short 2-second spectrogram
    short_input = torch.randn(2, 1, 128, 32)
    # Long 8-second spectrogram
    long_input = torch.randn(2, 1, 128, 128)

    with torch.no_grad():
        out_short = model(short_input)
        out_long = model(long_input)

    assert out_short.shape == (2, 2)
    assert out_long.shape == (2, 2)
