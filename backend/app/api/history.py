from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.core.database import get_db, AnalysisRecord, AuditLog

router = APIRouter(prefix="/api", tags=["History & Audit Trail"])


@router.get("/history")
async def get_history(limit: int = 30, db: AsyncSession = Depends(get_db)):
    """
    Returns list of past patient analysis records.
    """
    query = select(AnalysisRecord).order_by(desc(AnalysisRecord.created_at)).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "count": len(records),
        "history": [
            {
                "session_id": r.session_id,
                "patient_tag": r.patient_tag,
                "filename": r.filename,
                "duration_seconds": r.duration_seconds,
                "classification": r.classification,
                "confidence_score": r.confidence_score,
                "abnormal_probability": r.abnormal_probability,
                "total_segments": r.total_segments,
                "anomalous_segments_count": r.anomalous_segments_count,
                "report_summary": r.report_summary,
                "guardrail_passed": bool(r.guardrail_passed),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]
    }


@router.get("/audit-logs/{session_id}")
async def get_audit_trail(session_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns complete tamper-evident audit log for a specific analysis session.
    """
    query = select(AuditLog).where(AuditLog.session_id == session_id)
    result = await db.execute(query)
    audit = result.scalars().first()

    if not audit:
        raise HTTPException(status_code=404, detail="Audit log not found for this session ID.")

    return {
        "session_id": audit.session_id,
        "audio_sha256": audit.audio_sha256,
        "model_version": audit.model_version,
        "timestamp": audit.timestamp.isoformat() if audit.timestamp else None,
        "dsp_parameters": audit.dsp_parameters,
        "segment_probabilities": audit.segment_probabilities,
        "agent_input_payload": audit.agent_input_payload,
        "raw_agent_output": audit.raw_agent_output,
        "sanitized_agent_output": audit.sanitized_agent_output,
        "guardrail_checks": audit.guardrail_checks
    }
