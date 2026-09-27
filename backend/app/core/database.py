import os
import datetime
from typing import AsyncGenerator
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../cardiosense.db"))
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()


class AnalysisRecord(Base):
    """
    Stores historical heart sound analysis sessions.
    """
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    patient_tag = Column(String(128), default="Anonymous / Demo Patient")
    filename = Column(String(256), nullable=False)
    audio_sha256 = Column(String(64), index=True, nullable=False)
    duration_seconds = Column(Float, nullable=False)
    
    # Predictions
    classification = Column(String(32), nullable=False)  # Normal / Abnormal
    confidence_score = Column(Float, nullable=False)
    abnormal_probability = Column(Float, nullable=False)
    normal_probability = Column(Float, nullable=False)
    total_segments = Column(Integer, nullable=False)
    anomalous_segments_count = Column(Integer, nullable=False)
    
    # Clinical Report
    report_summary = Column(Text, nullable=False)
    clinical_findings = Column(JSON, nullable=False)
    guardrail_passed = Column(Integer, default=1)  # 1 = True, 0 = False
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class AuditLog(Base):
    """
    Tamper-evident audit log recording raw model tensors, prompt traces,
    filter specs, and validation results.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=False)
    audio_sha256 = Column(String(64), nullable=False)
    model_version = Column(String(64), default="CardioSense-CNN-v1.0")
    
    # DSP and Raw Probabilities
    dsp_parameters = Column(JSON, nullable=False)
    segment_probabilities = Column(JSON, nullable=False)
    
    # Agent & Guardrail Trace
    agent_input_payload = Column(JSON, nullable=False)
    raw_agent_output = Column(Text, nullable=False)
    sanitized_agent_output = Column(Text, nullable=False)
    guardrail_checks = Column(JSON, nullable=False)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)


async def init_db():
    """Initializes SQLite database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency for database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
