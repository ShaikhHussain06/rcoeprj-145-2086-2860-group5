import urllib.request
import json
import sys

try:
    req = urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=5)
    data = json.loads(req.read().decode('utf-8'))
    print("SUCCESS:", data)
except Exception as e:
    print("FAILED:", e)
    sys.exit(1)
