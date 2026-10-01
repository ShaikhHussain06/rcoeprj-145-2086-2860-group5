import sys, os
sys.path.insert(0, os.path.abspath("."))
import torch
import torch.nn.functional as F
from backend.app.ml.resnet import CardioResNet18
from backend.app.dsp.audio_cleaner import AudioCleaner
from backend.app.dsp.feature_extractor import FeatureExtractor

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = CardioResNet18(num_classes=2).to(device)
sd = torch.load("backend/app/ml/weights/exp3_resnet18.pt", map_location=device)
model.load_state_dict(sd)
model.eval()

cleaner = AudioCleaner(target_sr=2000, window_duration=4.0)
extractor = FeatureExtractor(sr=2000, n_mels=128)

for fid, label in [("a0007", "Normal"), ("a0009", "Normal"), ("a0011", "Normal"), ("a0001", "Abnormal"), ("a0002", "Abnormal"), ("a0003", "Abnormal")]:
    _, cleaned = cleaner.process(f"data/validation/{fid}.wav")
    segs = cleaner.segment_audio(cleaned)
    # Test segment 0
    spec0 = extractor.compute_mel_spectrogram(segs[0])
    tensor0 = torch.from_numpy(spec0).unsqueeze(0).unsqueeze(0).to(device)
    with torch.no_grad():
        p0 = F.softmax(model(tensor0), dim=1)[0].cpu().numpy()
    
    # Test all segments
    all_p = []
    for s in segs:
        sp = extractor.compute_mel_spectrogram(s)
        t = torch.from_numpy(sp).unsqueeze(0).unsqueeze(0).to(device)
        with torch.no_grad():
            prob = F.softmax(model(t), dim=1)[0, 1].item()
            all_p.append(prob)
    
    print(f"[{label} {fid}] Seg0 P(Abn): {p0[1]:.4f} | Mean All: {sum(all_p)/len(all_p):.4f} | Median: {sorted(all_p)[len(all_p)//2]:.4f} | Min: {min(all_p):.4f} | Max: {max(all_p):.4f}")
