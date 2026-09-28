import hashlib
import uuid
import json
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import AnalysisRecord, AuditLog


class AuditLogger:
    """
    CardioSense Tamper-Evident Audit Logging Service:
    - Generates SHA-256 cryptographic hashes of raw PCG audio recordings.
    - Persists session analysis records and deep audit trails.
    - Enables compliance inspection, clinician verification, and reproducibility.
    """

    @staticmethod
    def calculate_sha256(audio_bytes: bytes) -> str:
        """Computes SHA-256 hash of audio byte buffer."""
        hasher = hashlib.sha256()
        hasher.update(audio_bytes)
        return hasher.hexdigest()

    async def log_session(
        self,
        db: AsyncSession,
        audio_bytes: bytes,
        filename: str,
        patient_tag: str,
        inference_result: Dict[str, Any],
        clinical_report: Dict[str, Any],
    ) -> str:
        """
        Persists both AnalysisRecord and detailed AuditLog into SQLite.
        Returns the generated session_id.
        """
        session_id = f"CS-{uuid.uuid4().hex[:12].upper()}"
        audio_sha = self.calculate_sha256(audio_bytes)

        # 1. Create Analysis Record (for history & user dashboard)
        record = AnalysisRecord(
            session_id=session_id,
            patient_tag=patient_tag,
            filename=filename,
            audio_sha256=audio_sha,
            duration_seconds=inference_result["audio_duration_seconds"],
            classification=inference_result["classification"],
            confidence_score=inference_result["confidence_score"],
            abnormal_probability=inference_result["abnormal_probability"],
            normal_probability=inference_result["normal_probability"],
            total_segments=inference_result["total_segments_analyzed"],
            anomalous_segments_count=inference_result["anomalous_segments_count"],
            report_summary=clinical_report["summary"],
            clinical_findings=clinical_report["findings"],
            guardrail_passed=1 if clinical_report["guardrail_audit"]["grounding_check"] else 0
        )
        db.add(record)

        # 2. Create Deep Audit Log (for clinical verification & compliance)
        audit = AuditLog(
            session_id=session_id,
            audio_sha256=audio_sha,
            model_version="CardioSense-2DCNN-v1.0",
            dsp_parameters={
                "target_sample_rate_hz": 2000,
                "bandpass_filter": "Butterworth 4th-order zero-phase",
                "frequency_band_hz": [20.0, 200.0],
                "mel_spectrogram_bands": 128,
                "window_duration_sec": 4.0,
                "hop_duration_sec": 2.0
            },
            segment_probabilities=inference_result["segments"],
            agent_input_payload={
                "classification": inference_result["classification"],
                "confidence_score": inference_result["confidence_score"],
                "anomalous_segments_count": inference_result["anomalous_segments_count"]
            },
            raw_agent_output=clinical_report["summary"],
            sanitized_agent_output=clinical_report["full_report_markdown"],
            guardrail_checks=clinical_report["guardrail_audit"]
        )
        db.add(audit)

        await db.commit()
        return session_id
