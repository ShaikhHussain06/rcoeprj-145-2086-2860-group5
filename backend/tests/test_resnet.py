import torch
import pytest
from backend.app.ml.resnet import CardioResNet18


def test_cardioresnet18_forward():
    """
    Test CardioResNet18 forward pass with (Batch, 1, 128, Time) input tensors.
    """
    batch_size = 4
    n_mels = 128
    time_steps = 63

    dummy_input = torch.randn(batch_size, 1, n_mels, time_steps)
    model = CardioResNet18(num_classes=2)
    model.eval()

    with torch.no_grad():
        output = model(dummy_input)

    assert output.shape == (batch_size, 2)
    assert not torch.isnan(output).any()


def test_cardioresnet18_adaptive_pooling():
    """
    Test CardioResNet18 handling variable duration audio spectrograms.
    """
    model = CardioResNet18(num_classes=2)
    model.eval()

    short_spec = torch.randn(2, 1, 128, 25)
    long_spec = torch.randn(2, 1, 128, 120)

    with torch.no_grad():
        out_short = model(short_spec)
        out_long = model(long_spec)

    assert out_short.shape == (2, 2)
    assert out_long.shape == (2, 2)
