import sys, os
sys.path.insert(0, os.path.abspath("."))
import csv
import numpy as np
from sklearn.metrics import roc_auc_score, confusion_matrix
from backend.app.ml.inference import InferenceEngine

engine = InferenceEngine(weights_path="backend/app/ml/weights/exp3_resnet18.pt")
ref_csv = "data/validation/REFERENCE.csv"

y_true = []
y_pred_mean = []
y_pred_median = []

with open(ref_csv, "r") as f:
    for row in csv.reader(f):
        if not row: continue
        fid, lbl = row[0].strip(), row[1].strip()
        wav = f"data/validation/{fid}.wav"
        if not os.path.exists(wav): continue
        target = 0 if lbl == "-1" else 1
        y_true.append(target)
        
        _, cleaned = engine.cleaner.process(wav)
        segs = engine.cleaner.segment_audio(cleaned)
        batch = []
        for s in segs:
            mel = engine.extractor.compute_mel_spectrogram(s)
            import torch
            batch.append(torch.from_numpy(mel).unsqueeze(0).unsqueeze(0).to(engine.device))
        
        with torch.no_grad():
            full = torch.cat(batch, dim=0)
            logits = engine.model(full)
            import torch.nn.functional as F
            probs = F.softmax(logits, dim=1)[:, 1].cpu().numpy()
        
        y_pred_mean.append(float(np.mean(probs)))
        y_pred_median.append(float(np.median(probs)))

y_t = np.array(y_true)
p_mean = np.array(y_pred_mean)
p_med = np.array(y_pred_median)

auc_mean = roc_auc_score(y_t, p_mean)
auc_med = roc_auc_score(y_t, p_med)

print(f"PATIENT-LEVEL MEAN ROC-AUC: {auc_mean:.4f}")
print(f"PATIENT-LEVEL MEDIAN ROC-AUC: {auc_med:.4f}")

# Find best threshold on mean
best_j = -1
best_tau = 0.5
for tau in np.linspace(0.2, 0.8, 61):
    preds = (p_mean >= tau).astype(int)
    cm = confusion_matrix(y_t, preds)
    tn, fp, fn, tp = cm.ravel()
    sens = tp / (tp + fn)
    spec = tn / (tn + fp)
    j = sens + spec - 1
    if j > best_j:
        best_j = j
        best_tau = tau
        best_sens = sens
        best_spec = spec

print(f"BEST TAU on MEAN: {best_tau:.4f} | Sens: {best_sens*100:.1f}% | Spec: {best_spec*100:.1f}% | Youden J: {best_j:.4f}")
