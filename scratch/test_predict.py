import urllib.request
import urllib.parse
import json
import mimetypes
import uuid

# Load a real sample from data/validation
sample_path = "data/validation/a0001.wav"
with open(sample_path, "rb") as f:
    file_bytes = f.read()

boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
data = []
data.append(f"--{boundary}".encode())
data.append(b'Content-Disposition: form-data; name="file"; filename="a0001.wav"')
data.append(b"Content-Type: audio/wav")
data.append(b"")
data.append(file_bytes)
data.append(f"--{boundary}".encode())
data.append(b'Content-Disposition: form-data; name="patient_tag"')
data.append(b"")
data.append(b"Prof Test Case #01")
data.append(f"--{boundary}--".encode())
data.append(b"")

body = b"\r\n".join(data)

req = urllib.request.Request("http://127.0.0.1:8000/api/predict", data=body)
req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("PREDICT STATUS:", res["status"])
        print("SESSION ID:", res["session_id"])
        print("CLASSIFICATION:", res["inference"]["classification"])
        print("CONFIDENCE:", res["inference"]["confidence_score"])
        print("SEGMENTS COUNT:", res["inference"]["total_segments"])
        print("SPECTROGRAM IMAGE LEN:", len(res["inference"]["spectrogram_image"]))
        print("CLINICAL SUMMARY:", res["clinical_report"]["clinical_summary"][:120])
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
