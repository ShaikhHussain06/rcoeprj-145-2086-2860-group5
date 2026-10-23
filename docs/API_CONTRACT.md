# CardioSense AI — API Contract Specification

> **Source of Truth**: Derived directly from `backend/app/main.py`, `backend/app/api/`, and `backend/app/core/database.py`.  
> **Status**: Current & Synchronized with CardioSense Backend v1.0.0.

---

## 1. General Architecture & Standards

- **Base URL (Local Dev)**: `http://localhost:8000` (or `http://<LAN_IP>:8000` for mobile access)
- **CORS Configuration**: Allowed origins: `*`, Methods: `*`, Headers: `*`
- **Audio Standards**:
  - Internal DSP standard: 2,000 Hz, 1-channel mono, 4th-order zero-phase Butterworth bandpass (20–200 Hz).
  - Web/Mobile playback stream standard: 44,100 Hz 16-bit PCM WAV.
- **Visuals Returned**: Waveform and Mel-Spectrogram plots are returned as **Base64-encoded PNG data URIs** (`data:image/png;base64,...`), NOT raw numeric arrays.

---

## 2. Endpoints Catalog

### 2.1 Server Health & Compute Diagnostics
- **Route**: `GET /health`
- **Description**: Returns operational state, compute device (CUDA / CPU), and active DSP configuration.
- **Request Headers**: None
- **Query / Body Parameters**: None
- **Response Schema** (`200 OK`):
```json
{
  "status": "online",
  "service": "CardioSense Auscultation Intelligence API",
  "version": "1.0.0",
  "compute_device": "cpu",
  "dsp_pipeline": "Butterworth 4th-Order 20-200Hz Bandpass + 2kHz Resampling"
}
```

---

### 2.2 Curated Benchmark Sample Library
- **Route**: `GET /api/sample-audios`
- **Description**: Returns metadata for curated PhysioNet benchmark recordings.
- **Query / Body Parameters**: None
- **Response Schema** (`200 OK`):
```json
{
  "samples": [
    {
      "id": "a0007",
      "title": "Normal Heart Sound (Sample a0007)",
      "condition": "Normal",
      "clinical_context": "Pristine physiological S1/S2 rhythm, regular 72 BPM cadence, clear systolic/diastolic intervals.",
      "duration_sec": 35.7,
      "audio_url": "/api/sample-audios/a0007"
    },
    {
      "id": "a0006",
      "title": "Severe Pathological Murmur (Sample a0006)",
      "condition": "Abnormal",
      "clinical_context": "Intense continuous systolic turbulence envelope with marked high-frequency acoustic power (>92% abnormal confidence).",
      "duration_sec": 35.0,
      "audio_url": "/api/sample-audios/a0006"
    },
    {
      "id": "a0001",
      "title": "Mitral Regurgitation Murmur (Sample a0001)",
      "condition": "Abnormal",
      "clinical_context": "Moderate systolic regurgitation turbulence near optimal decision boundary (54.4% abnormal prob, tau*=0.4900).",
      "duration_sec": 35.0,
      "audio_url": "/api/sample-audios/a0001"
    },
    {
      "id": "a0003",
      "title": "Holosystolic Murmur (Sample a0003)",
      "condition": "Abnormal",
      "clinical_context": "High-frequency plateau murmur envelope throughout systole with pronounced energy (82.4% abnormal prob).",
      "duration_sec": 30.7,
      "audio_url": "/api/sample-audios/a0003"
    },
    {
      "id": "a0004",
      "title": "Normal Heart Sound (Sample a0004)",
      "condition": "Normal",
      "clinical_context": "Clear cardiac cycle with healthy lub-dub acoustic signature, 33.3% abnormal prob.",
      "duration_sec": 35.0,
      "audio_url": "/api/sample-audios/a0004"
    }
  ]
}
```

---

### 2.3 Stream Audio File
- **Route**: `GET /api/sample-audios/{file_id}`
- **Parameters**: `file_id` (path string, e.g., `a0007`)
- **Response**: Binary audio stream (`media_type: audio/wav`, 44.1 kHz 16-bit PCM WAV) with HTTP `Accept-Ranges: bytes`.
- **Error**: `404 Not Found` if the file is not on disk.

---

### 2.4 DSP Signal Preview (Waveform & Spectrogram Images)
- **Route**: `POST /api/dsp-preview`
- **Content-Type**: `multipart/form-data`
- **Request Fields**:
  - `file`: Binary audio file (WAV, MP3, WebM) [Required]
- **Response Schema** (`200 OK`):
```json
{
  "status": "success",
  "filename": "a0007.wav",
  "duration_seconds": 35.7,
  "sample_rate": 2000,
  "spectrogram_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "waveform_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

---

### 2.5 Full Inference & Clinical Auscultation Analysis
- **Route**: `POST /api/predict`
- **Content-Type**: `multipart/form-data`
- **Request Fields**:
  - `file`: Binary audio file [Required]
  - `patient_tag`: String tag for identification (default: `"Demo Patient / Routine Auscultation"`) [Optional Form Field]
- **Response Schema** (`200 OK`):
```json
{
  "status": "success",
  "session_id": "CS-525692A49B80",
  "filename": "a0007.wav",
  "patient_tag": "Demo Patient / Routine Auscultation",
  "inference": {
    "classification": "Normal",
    "confidence_score": 0.6586,
    "abnormal_probability": 0.3414,
    "normal_probability": 0.6586,
    "audio_duration_seconds": 35.7,
    "total_segments": 17,
    "anomalous_segments_count": 0,
    "segments": [
      {
        "segment_index": 1,
        "start_time_sec": 0.0,
        "end_time_sec": 4.0,
        "normal_probability": 0.6812,
        "abnormal_probability": 0.3188,
        "status": "Normal Rhythm",
        "severity_score": 31.9
      }
    ],
    "spectrogram_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "waveform_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  },
  "clinical_report": {
    "summary": "Phonocardiogram recording of 35.7s demonstrates rhythmic S1/S2 acoustic intervals with balanced acoustic energy. Overall confidence is 65.9%. No predominant pathological murmur turbulence was detected across the 17 analyzed segments.",
    "findings": [
      {
        "category": "Spectral Frequency Profile (20-200 Hz)",
        "observation": "Acoustic signal filtered via 4th-order zero-phase Butterworth bandpass. Energy within primary cardiac range (20–200 Hz) analyzed for murmur turbulence.",
        "status": "Nominal"
      },
      {
        "category": "Cardiac Cycle Regularity",
        "observation": "Regular fundamental Lub-Dub (S1/S2) acoustic timing across recording windows.",
        "status": "Regular"
      },
      {
        "category": "Segment 1 (0.0s - 4.0s)",
        "observation": "Normal baseline acoustic envelope (Normal: 68.1%).",
        "status": "Normal Rhythm",
        "severity_score": 31.9
      }
    ],
    "recommendations": [
      "No urgent phonocardiographic flags detected on current recording.",
      "Maintain standard routine preventive cardiac auscultation.",
      "If patient reports active palpitations or chest discomfort, conduct standard 12-lead ECG."
    ],
    "full_report_markdown": "## CardioSense Clinical Auscultation Summary\n\n...",
    "guardrail_audit": {
      "all_rules_passed": true,
      "grounding_check": true,
      "modifications_applied": [
        "Appended standard investigational clinical disclaimer"
      ],
      "classification_grounding": "Normal",
      "abnormal_prob_grounding": 0.3414,
      "disclaimer_present": true
    },
    "anomalous_segments_count": 0
  }
}
```

---

### 2.6 Analysis History
- **Route**: `GET /api/history`
- **Query Parameters**:
  - `limit`: Integer (default: 30)
- **Response Schema** (`200 OK`):
```json
{
  "count": 1,
  "history": [
    {
      "session_id": "CS-525692A49B80",
      "patient_tag": "Demo Patient",
      "filename": "a0007.wav",
      "duration_seconds": 35.7,
      "classification": "Normal",
      "confidence_score": 0.6586,
      "abnormal_probability": 0.3414,
      "total_segments": 17,
      "anomalous_segments_count": 0,
      "report_summary": "Phonocardiogram recording of 35.7s...",
      "guardrail_passed": true,
      "created_at": "2026-10-20T10:15:30.123456"
    }
  ]
}
```

---

### 2.7 Tamper-Evident Session Audit Trail
- **Route**: `GET /api/audit-logs/{session_id}`
- **Parameters**: `session_id` (string, e.g., `CS-525692A49B80`)
- **Response Schema** (`200 OK`):
```json
{
  "session_id": "CS-525692A49B80",
  "audio_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "model_version": "CardioSense-CNN-v1.0",
  "timestamp": "2026-10-20T10:15:30.123456",
  "dsp_parameters": { ... },
  "segment_probabilities": [ ... ],
  "agent_input_payload": { ... },
  "raw_agent_output": "...",
  "sanitized_agent_output": "...",
  "guardrail_checks": { ... }
}
```

---

### 2.8 Evaluation Metrics
- **Route**: `GET /api/evaluation-metrics`
- **Description**: Returns validation test set performance metrics for CardioResNet-18.
- **Response Schema** (`200 OK`):
```json
{
  "status": "trained_resnet18",
  "metrics": {
    "experiment": "exp3_resnet18",
    "model_type": "resnet18",
    "roc_auc": 0.8041,
    "optimal_threshold": 0.2636,
    "sensitivity_at_optimal": 0.8278,
    "specificity_at_optimal": 0.6333,
    "false_positives_at_optimal": 55,
    "false_negatives_at_optimal": 26,
    "sensitivity_at_default": 0.6291,
    "specificity_at_default": 0.7867,
    "confusion_matrix_at_optimal": {
      "true_positive": 125,
      "true_negative": 95,
      "false_positive": 55,
      "false_negative": 26
    }
  }
}
```

---

## 3. Decision Boundary & Probability Banding Rules

The calibrated optimal classification threshold is **$\tau^* = 0.4900$**:
- **0.00% – 34.99%**: High Confidence Normal (Rhythmic S1/S2 cadence, quiet baseline).
- **35.00% – 48.99%**: Borderline / Benign (Minor acoustic variance or physiologic splitting; below threshold).
- **49.00% – 69.99%**: Moderate Murmur Turbulence (Elevated spectral density exceeding $\tau^*=0.4900$).
- **70.00% – 100.00%**: Severe Murmur / Marked Pathology (Continuous harsh turbulence envelope).
