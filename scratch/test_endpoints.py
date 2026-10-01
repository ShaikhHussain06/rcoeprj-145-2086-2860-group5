import urllib.request
import json
import os

req = urllib.request.urlopen("http://127.0.0.1:8000/api/sample-audios")
samples_data = json.loads(req.read().decode('utf-8'))
print("Found samples:", [s['id'] for s in samples_data.get('samples', [])])

# Test evaluation metrics
req2 = urllib.request.urlopen("http://127.0.0.1:8000/api/evaluation-metrics")
eval_data = json.loads(req2.read().decode('utf-8'))
print("Eval metrics keys:", eval_data.keys())
print("ROC-AUC:", eval_data.get('evaluation_metrics', {}).get('roc_auc'))
