import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBlock(nn.Module):
    """
    Standard Convolutional block with Conv2D -> BatchNorm -> ReLU -> MaxPool2D -> Dropout.
    """
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int = 3, dropout_rate: float = 0.25):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=kernel_size, padding=kernel_size // 2, bias=False)
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.dropout = nn.Dropout2d(dropout_rate)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv(x)
        x = self.bn(x)
        x = self.relu(x)
        x = self.pool(x)
        x = self.dropout(x)
        return x


class CardioSenseCNN(nn.Module):
    """
    CardioSense Deep 2D-CNN for Phonocardiogram (PCG) Spectrogram Classification.
    Input: Tensor of shape (Batch, 1, n_mels=128, time_steps)
    Output: Logits of shape (Batch, num_classes=2) -> [Normal, Abnormal]
    """
    def __init__(self, num_classes: int = 2, in_channels: int = 1):
        super().__init__()
        
        self.layer1 = ConvBlock(in_channels, 32, kernel_size=3, dropout_rate=0.20)
        self.layer2 = ConvBlock(32, 64, kernel_size=3, dropout_rate=0.25)
        self.layer3 = ConvBlock(64, 128, kernel_size=3, dropout_rate=0.30)
        self.layer4 = ConvBlock(128, 256, kernel_size=3, dropout_rate=0.35)

        # Global average pooling adapts to variable-length spectrogram time axes
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))

        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.40),
            nn.Linear(128, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Pass through convolutional feature extractor
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        # Global pooling and flattening
        x = self.global_pool(x)
        x = torch.flatten(x, 1)

        # Classification logits
        logits = self.classifier(x)
        return logits
