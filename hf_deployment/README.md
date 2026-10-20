---
license: mit
language:
- en
tags:
- audio
- classification
- heart-sound
- phonocardiogram
- medical
- pytorch
- resnet
- PCG
- murmur-detection
- cardiology
pipeline_tag: audio-classification
metrics:
- roc_auc
- f1
model_name: CardioSense-ResNet18-PCG
---

# 🫀 CardioSense ResNet-18 — Phonocardiogram (PCG) Murmur Classifier

**CardioSense** is a deep residual convolutional neural network trained to detect **pathological heart murmurs and valvular defects** from phonocardiogram (PCG) stethoscope recordings.
It achieves **ROC-AUC 0.8041** and **82.78% sensitivity** on the PhysioNet CinC 2016 benchmark.

---

## Model Summary

| Property | Value |
|---|---|
| **Architecture** | CardioResNet-18 (Deep 2D Residual CNN) |
| **Task** | Binary Audio Classification (Normal vs. Abnormal) |
| **Input** | Log-Mel Spectrogram `(1, 128, time_steps)` |
| **Output** | Softmax probabilities `[P_normal, P_abnormal]` |
| **Decision Threshold** | tau* = 0.4900 (Youden's J optimal) |
| **Dataset** | PhysioNet CinC 2016 PCG Challenge |
| **ROC-AUC** | **0.8041** |
| **Sensitivity** | **82.78%** (murmur recall) |
| **Specificity** | **63.33%** |
| **Parameters** | ~11.2M |
| **Framework** | PyTorch 2.x |

---

## DSP & Preprocessing Pipeline

```
Raw Audio (.wav/.mp3)
   -> 1. Resample to 2,000 Hz
   -> 2. Downmix to Mono
   -> 3. 4th-Order Butterworth Bandpass (20 Hz to 200 Hz), zero-phase filtfilt
   -> 4. Peak Amplitude Normalization to [-1.0, 1.0]
   -> 5. Sliding Window Segmentation (4.0s window, 2.0s hop, 50% overlap)
   -> 6. 128-Band Log-Mel Spectrogram (n_fft=512, hop=128, fmin=20, fmax=400 Hz)
   -> 7. Tensor: (1, 128, time_steps)
```

---

## Usage

### Install
```bash
pip install torch librosa scipy soundfile numpy
```

### Inference
```python
import torch, torch.nn.functional as F
import numpy as np, librosa, scipy.signal, soundfile as sf
from cardio_resnet import CardioResNet18

model = CardioResNet18(num_classes=2)
model.load_state_dict(torch.load("cardiosense_resnet18.pt", map_location="cpu"))
model.eval()

def preprocess(path, sr=2000):
    y, orig_sr = sf.read(path)
    if y.ndim > 1: y = y.mean(axis=1)
    if orig_sr != sr: y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
    nyq = sr / 2
    b, a = scipy.signal.butter(4, [20/nyq, 200/nyq], btype="bandpass")
    y = scipy.signal.filtfilt(b, a, y).astype(np.float32)
    return y / (np.max(np.abs(y)) + 1e-6), sr

def mel(seg, sr=2000):
    m = librosa.feature.melspectrogram(y=seg, sr=sr, n_fft=512, hop_length=128,
                                        n_mels=128, fmin=20, fmax=400, power=2)
    m = librosa.power_to_db(m, ref=np.max)
    mn, mx = m.min(), m.max()
    return ((2*(m-mn)/(mx-mn)-1) if mx-mn>1e-6 else np.zeros_like(m)).astype(np.float32)

audio, sr = preprocess("heart_sound.wav")
TAU, W, H = 0.4900, 4*sr, 2*sr
probs = []
with torch.no_grad():
    for i in range(0, len(audio), H):
        seg = audio[i:i+W]
        if len(seg) < W: seg = np.pad(seg, (0, W-len(seg)))
        x = torch.from_numpy(mel(seg)).unsqueeze(0).unsqueeze(0)
        probs.append(F.softmax(model(x), dim=1)[0,1].item())

p = float(np.mean(probs))
print(f"{'Abnormal' if p >= TAU else 'Normal'}  |  Abnormal Prob: {p:.3f}  |  Conf: {max(p,1-p)*100:.1f}%")
```

---

## Evaluation (PhysioNet Test Set, n=301)

| Metric | tau*=0.4900 | tau=0.50 |
|---|---|---|
| ROC-AUC | **0.8041** | 0.8041 |
| Sensitivity | **82.78%** | 62.91% |
| Specificity | **63.33%** | 78.67% |
| True Positives | 125/151 | 95/151 |
| False Negatives | 26 | 56 |

---

## Architecture

```
Input (B, 1, 128, T)
  Stem: Conv7x7(64) -> BN -> ReLU -> MaxPool
  Stage1: 2x ResBlock(64->64,  s=1)
  Stage2: 2x ResBlock(64->128, s=2)
  Stage3: 2x ResBlock(128->256,s=2)
  Stage4: 2x ResBlock(256->512,s=2)
  AdaptiveAvgPool2d(1,1)
  Dropout(0.35)
  Linear(512->2)
```

---

## Clinical Disclaimer

> CardioSense is an investigational acoustic screening tool. It does NOT provide a definitive medical diagnosis. All findings must be correlated with clinical history, stethoscope auscultation, and echocardiography by a licensed healthcare professional.
