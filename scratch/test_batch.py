import sys, os
sys.path.insert(0, os.path.abspath("."))
import csv
from backend.app.ml.inference import InferenceEngine

engine = InferenceEngine(weights_path='backend/app/ml/weights/exp3_resnet18.pt')
ref_csv = 'data/validation/REFERENCE.csv'

normals, abnormals = [], []
with open(ref_csv, 'r') as f:
    for row in csv.reader(f):
        if not row: continue
        fid, lbl = row[0].strip(), row[1].strip()
        wav = f'data/validation/{fid}.wav'
        if not os.path.exists(wav): continue
        if lbl == '-1' and len(normals) < 5:
            normals.append(wav)
        elif lbl == '1' and len(abnormals) < 5:
            abnormals.append(wav)

print('=== NORMALS (Ground truth Normal) ===')
for p in normals:
    res = engine.predict(p)
    print(os.path.basename(p), 'Class:', res['classification'], 'P(Abnormal):', f"{res['abnormal_probability']:.4f}")

print('=== ABNORMALS (Ground truth Abnormal) ===')
for p in abnormals:
    res = engine.predict(p)
    print(os.path.basename(p), 'Class:', res['classification'], 'P(Abnormal):', f"{res['abnormal_probability']:.4f}")
