# CardioSense: AI-Powered Phonocardiogram (PCG) Analysis Platform
## Project Architecture, Implementation Plan & Tech Stack

---

## 1. Project Overview
**CardioSense** is a clinical-grade heart sound classification system that captures phonocardiogram (PCG) acoustic signals, cleans them via digital signal processing (DSP), classifies normal vs. abnormal cardiac acoustic signatures using a PyTorch Convolutional Neural Network (CNN), and generates structured, guardrailed clinical reports with verifiable audit trails.

---

## 2. Core Pillars & Architecture

### A. Digital Signal Processing (DSP) & Feature Engineering
- **Resampling**: Standardized to 2,000 Hz.
- **Filtering**: 4th-order zero-phase Butterworth Bandpass filter ($20\text{ Hz} - 200\text{ Hz}$) targeting primary S1/S2 acoustic frequencies and murmurs while eliminating ambient and speech noise.
- **Normalization**: Zero-mean, unit-variance or peak amplitude scaling.
- **Feature Extraction**: Log Mel-Spectrograms (128 bands) representing time-frequency energy distribution.

### B. Deep Learning Classifier (PyTorch CNN)
- 2D Convolutional Neural Network taking Mel-spectrogram patches.
- Outputs confidence distributions for **Normal** vs **Abnormal (Murmur/Arrhythmia)**.
- Evaluates both at segment level and patient-aggregated level (max/mean pooling).

### C. Automated AI Evaluation Pipeline (Clinical QA & Gating)
- **Metrics Suite**: Evaluates Sensitivity (Recall on Abnormal), Specificity (True Negative Rate), Precision, F1-Score, and ROC-AUC curve.
- **False Negative Rate (FNR) Minimization Gate**: Medical classifiers prioritize minimizing missed abnormalities; automated checks ensure high recall (>90%).
- **Regression Gates**: Prevents preprocessing or hyperparameter alterations from silently degrading model performance.

### D. Clinical Report AI Agent with Audit Logging
- Summarizes CNN predictions and segment-level anomalies into an interpretable clinical summary (e.g., *"Elevated high-frequency turbulence detected in Segments 2 and 4 (3.2s–6.5s) consistent with systolic murmur acoustic features"*).
- **Audit Logging**: Persists SHA-256 audio segment hashes, raw probability vectors, filter parameters, prompt traces, model version, and timestamp into an inspectable audit table.

### E. Medical Guardrails & Output Sanitization Layer
- **No Direct Diagnosis Rule**: Replaces definitive diagnostic claims with descriptive acoustic observations and risk classifications.
- **Grounding Verification**: Ensures AI report claims strictly reflect the numerical confidence scores output by the CNN.
- **Disclaimer Injection**: Appends standardized clinical investigation disclaimers to all outputs.

---

## 3. Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, HTML5 Web Audio API, Canvas API, Lucide Icons.
- **Backend API**: FastAPI (Python 3.10+), Pydantic v2, Uvicorn.
- **Audio & DSP**: `librosa`, `scipy.signal`, `soundfile`, `numpy`.
- **Machine Learning**: PyTorch (`torch`, `torchaudio`), `scikit-learn`.
- **AI Agent & Guardrails**: Structured Prompting / LLM integration + Custom Pydantic Guardrail & Sanitization Engine.
- **Database / Audit**: SQLite + SQLAlchemy.
- **Testing & Evaluation**: `pytest`, `matplotlib`, `seaborn`.

---

## 4. Phased Implementation Roadmap

1. **Phase 1: ML & Signal Processing Foundation**
   - Butterworth 20–200Hz Bandpass filter + 2kHz Resampler.
   - Mel-spectrogram generator + base64 image export for visualizer.
   - PyTorch 2D CNN architecture and inference engine.
2. **Phase 2: Automated AI Evaluation Suite & Regression Tests**
   - Test suite tracking Sensitivity, Specificity, ROC-AUC, Confusion Matrix, and FNR.
   - Segment-level vs. patient-level aggregation.
3. **Phase 3: Clinical Report Agent, Guardrails & Audit Logger**
   - Report generator synthesizing segment probabilities into clinical language.
   - Guardrails engine preventing overclaiming and hallucination.
   - SQLite audit logging service.
4. **Phase 4: FastAPI REST API & Pre-loaded Clinical Benchmark Samples**
   - Endpoints: `/api/predict`, `/api/history`, `/api/audit-logs`, `/api/evaluation-metrics`, `/api/sample-audios`.
   - Sample heart sound library (Normal, Mitral Regurgitation, Aortic Stenosis).
5. **Phase 5: Medical Web App Frontend (React + Vite)**
   - Real-time microphone recorder with live waveform and frequency visualizers.
   - Drag-and-drop audio file uploader.
   - Diagnostic card with probability gauges and spectrogram viewer.
   - Interactive AI Clinical Report with Audit Trail inspector modal.
   - Model Evaluation & Quality Assurance dashboard tab.
