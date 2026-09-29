import os
import io
from typing import Dict, Any
import soundfile as sf
import scipy.signal as signal
import numpy as np
from fastapi import APIRouter, HTTPException, Response

router = APIRouter(prefix="/api", tags=["Demo & Benchmark Audio Samples"])

VALIDATION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/validation"))
REF_CSV = os.path.join(VALIDATION_DIR, "REFERENCE.csv")


@router.get("/sample-audios")
async def get_sample_audios() -> Dict[str, Any]:
    """
    Returns curated clinical heart sound samples from the PhysioNet dataset
    for instant browser playback and testing.
    """
    # Curated clinical samples with known PhysioNet ground truth
    curated_catalog = [
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

    # Verify files exist on disk
    samples = [s for s in curated_catalog if os.path.exists(os.path.join(VALIDATION_DIR, f"{s['id']}.wav"))]
    return {"samples": samples}


@router.get("/sample-audios/{file_id}")
async def get_sample_audio_file(file_id: str):
    """
    Streams a sample audio file to the browser converted to standard 44.1kHz 16-bit PCM
    so all modern browsers and HTML5 audio players can play it flawlessly.
    """
    wav_path = os.path.join(VALIDATION_DIR, f"{file_id}.wav")
    if not os.path.exists(wav_path):
        raise HTTPException(status_code=404, detail="Sample audio file not found.")

    try:
        data, sr = sf.read(wav_path)
        if sr != 44100:
            # PhysioNet 2000 Hz resampled to standard 44100 Hz (44100 = 2000 * 441 / 20)
            resampled = signal.resample_poly(data, 441, 20)
            max_val = np.max(np.abs(resampled))
            if max_val > 0:
                resampled = resampled / max_val
            int_data = (resampled * 32767).astype(np.int16)
            buf = io.BytesIO()
            sf.write(buf, int_data, 44100, format='WAV', subtype='PCM_16')
            content = buf.getvalue()
        else:
            with open(wav_path, "rb") as f:
                content = f.read()

        return Response(
            content=content,
            media_type="audio/wav",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Disposition": f'inline; filename="{file_id}.wav"',
                "Content-Length": str(len(content))
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio decoding error: {str(e)}")

