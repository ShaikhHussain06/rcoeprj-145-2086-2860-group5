import urllib.request
import json
import uuid

def test_file(file_id, label):
    with open(f"data/validation/{file_id}.wav", "rb") as f:
        audio = f.read()
    boundary = f"----Boundary{uuid.uuid4().hex}"
    parts = [
        f"--{boundary}".encode(),
        f'Content-Disposition: form-data; name="file"; filename="{file_id}.wav"'.encode(),
        b"Content-Type: audio/wav",
        b"",
        audio,
        f"--{boundary}".encode(),
        b'Content-Disposition: form-data; name="patient_tag"',
        b"",
        f"Validation Patient {file_id}".encode(),
        f"--{boundary}--".encode(),
        b""
    ]
    body = b"\r\n".join(parts)
    req = urllib.request.Request("http://127.0.0.1:8000/api/predict", data=body)
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        inf = res["inference"]
        print(f"[{label} {file_id}] Prediction: {inf['classification']} | Abnormal Prob: {inf['abnormal_probability']:.4f} | Conf: {inf['confidence_score']:.4f}")

test_file("a0007", "GROUND TRUTH NORMAL")
test_file("a0001", "GROUND TRUTH ABNORMAL")
