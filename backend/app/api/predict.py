import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.ml.inference import InferenceEngine
from backend.app.agent.report_agent import ClinicalReportAgent
from backend.app.agent.audit_logger import AuditLogger

router = APIRouter(prefix="/api", tags=["Inference & Diagnostics"])

VALIDATION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/validation"))

# Initialize singletons — weights are auto-resolved by InferenceEngine:
# Priority: HF-cached cardiosense_resnet18.pt → local exp3_resnet18.pt → HF download
inference_engine = InferenceEngine()
report_agent = ClinicalReportAgent()
audit_logger = AuditLogger()


@router.post("/predict")
async def analyze_heart_sound(
    file: UploadFile = File(...),
    patient_tag: Optional[str] = Form("Demo Patient / Routine Auscultation"),
    db: AsyncSession = Depends(get_db)
):
    """
    Complete CardioSense Analysis Endpoint:
    1. Ingests audio (.wav, .mp3, .webm, .ogg)
    2. Runs DSP (Resample 2kHz, 20-200Hz Butterworth bandpass filter, normalize)
    3. Computes Mel-Spectrogram & PyTorch CNN inference
    4. Generates Guardrailed Clinical Report
    5. Saves tamper-evident Audit Log & History Record
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 1000:
            raise HTTPException(status_code=400, detail="Audio file is too short or empty.")

        # Step 1 & 2: Inference & DSP
        inference_result = inference_engine.predict(audio_bytes)

        # Step 3: Clinical AI Report Generation & Guardrails
        clinical_report = report_agent.generate_report(inference_result, patient_tag=patient_tag or "Anonymous")

        # Step 4: Audit Logging
        session_id = await audit_logger.log_session(
            db=db,
            audio_bytes=audio_bytes,
            filename=file.filename,
            patient_tag=patient_tag or "Anonymous",
            inference_result=inference_result,
            clinical_report=clinical_report
        )

        return {
            "status": "success",
            "session_id": session_id,
            "filename": file.filename,
            "patient_tag": patient_tag,
            "inference": {
                "classification": inference_result["classification"],
                "confidence_score": inference_result["confidence_score"],
                "abnormal_probability": inference_result["abnormal_probability"],
                "normal_probability": inference_result["normal_probability"],
                "audio_duration_seconds": inference_result["audio_duration_seconds"],
                "total_segments": inference_result["total_segments_analyzed"],
                "anomalous_segments_count": inference_result["anomalous_segments_count"],
                "segments": inference_result["segments"],
                "spectrogram_image": inference_result["spectrogram_image"],
                "waveform_image": inference_result.get("waveform_image")
            },
            "clinical_report": clinical_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")


@router.post("/dsp-preview")
async def generate_dsp_preview(file: UploadFile = File(...)):
    """
    Instantly computes 100% genuine Butterworth-filtered PCG waveform and 128-band Mel-Spectrogram
    directly from the uploaded audio file using SciPy, Librosa, and Matplotlib.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 500:
            raise HTTPException(status_code=400, detail="Audio file is too short.")

        cleaner = inference_engine.cleaner
        extractor = inference_engine.extractor

        raw_audio, cleaned_audio = cleaner.process(audio_bytes)
        duration_sec = len(cleaned_audio) / cleaner.target_sr

        preview_dur = min(10.0, duration_sec)
        preview_samples = int(preview_dur * cleaner.target_sr)
        preview_sig = cleaned_audio[:preview_samples]

        spec_img = extractor.generate_spectrogram_image_base64(
            preview_sig, 
            title="Acoustic 128-Band Mel-Spectrogram (Librosa DSP)"
        )
        wave_img = extractor.generate_waveform_image_base64(
            preview_sig, 
            title="Filtered Acoustic Amplitude Waveform (Butterworth 20-200 Hz)"
        )

        return {
            "status": "success",
            "filename": file.filename,
            "duration_seconds": round(duration_sec, 2),
            "sample_rate": cleaner.target_sr,
            "spectrogram_image": spec_img,
            "waveform_image": wave_img
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DSP preview failed: {str(e)}")


@router.post("/predict-sample/{sample_id}")
async def analyze_benchmark_sample(
    sample_id: str,
    patient_tag: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct analysis of benchmark audio directly from disk without re-upload.
    Guarantees instant response and eliminates cleartext download-upload loops on mobile devices.
    """
    sample_clean = sample_id.replace(".wav", "").strip()
    sample_path = os.path.join(VALIDATION_DIR, f"{sample_clean}.wav")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail=f"Benchmark sample '{sample_clean}' not found on server.")

    with open(sample_path, "rb") as f:
        audio_bytes = f.read()

    tag = patient_tag or f"PhysioNet Case #{sample_clean.upper()}"
    inference_result = inference_engine.predict(audio_bytes)
    clinical_report = report_agent.generate_report(inference_result, patient_tag=tag)
    session_id = await audit_logger.log_session(
        db=db,
        audio_bytes=audio_bytes,
        filename=f"{sample_clean}.wav",
        patient_tag=tag,
        inference_result=inference_result,
        clinical_report=clinical_report
    )

    return {
        "status": "success",
        "session_id": session_id,
        "filename": f"{sample_clean}.wav",
        "patient_tag": tag,
        "inference": {
            "classification": inference_result["classification"],
            "confidence_score": inference_result["confidence_score"],
            "abnormal_probability": inference_result["abnormal_probability"],
            "normal_probability": inference_result["normal_probability"],
            "audio_duration_seconds": inference_result["audio_duration_seconds"],
            "total_segments": inference_result["total_segments_analyzed"],
            "anomalous_segments_count": inference_result["anomalous_segments_count"],
            "segments": inference_result["segments"],
            "spectrogram_image": inference_result["spectrogram_image"],
            "waveform_image": inference_result.get("waveform_image")
        },
        "clinical_report": clinical_report
    }


@router.get("/dsp-preview-sample/{sample_id}")
async def generate_benchmark_preview(sample_id: str):
    """Generates DSP preview directly from benchmark sample audio on server disk."""
    sample_clean = sample_id.replace(".wav", "").strip()
    sample_path = os.path.join(VALIDATION_DIR, f"{sample_clean}.wav")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail=f"Benchmark sample '{sample_clean}' not found on server.")

    with open(sample_path, "rb") as f:
        audio_bytes = f.read()

    cleaner = inference_engine.cleaner
    extractor = inference_engine.extractor
    raw_audio, cleaned_audio = cleaner.process(audio_bytes)
    duration_sec = len(cleaned_audio) / cleaner.target_sr
    preview_dur = min(10.0, duration_sec)
    preview_samples = int(preview_dur * cleaner.target_sr)
    preview_sig = cleaned_audio[:preview_samples]

    spec_img = extractor.generate_spectrogram_image_base64(
        preview_sig, 
        title="Acoustic 128-Band Mel-Spectrogram (Librosa DSP)"
    )
    wave_img = extractor.generate_waveform_image_base64(
        preview_sig, 
        title="Filtered Acoustic Amplitude Waveform (Butterworth 20-200 Hz)"
    )

    return {
        "status": "success",
        "filename": f"{sample_clean}.wav",
        "duration_seconds": round(duration_sec, 2),
        "sample_rate": cleaner.target_sr,
        "spectrogram_image": spec_img,
        "waveform_image": wave_img
    }


