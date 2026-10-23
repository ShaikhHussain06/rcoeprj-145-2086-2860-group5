import os
from typing import Dict, Any, List
import json

from backend.app.agent.guardrails import MedicalGuardrails


class ClinicalReportAgent:
    """
    CardioSense Clinical Report Agent:
    - Analyzes PyTorch CNN segment probabilities and DSP metrics.
    - Generates a clear, structured clinical phonocardiography report.
    - Highlights specific anomalous temporal segments (e.g., Segments 2-3 exhibiting murmur turbulence).
    - Routes all generated text through the Medical Guardrails layer before returning to UI/database.
    """

    def __init__(self):
        self.guardrails = MedicalGuardrails()

    def generate_report(self, inference_result: Dict[str, Any], patient_tag: str = "Anonymous") -> Dict[str, Any]:
        """
        Synthesizes CNN & DSP outputs into an actionable, guardrailed clinical summary.
        """
        classification = inference_result["classification"]
        confidence = inference_result["confidence_score"]
        abnormal_prob = inference_result["abnormal_probability"]
        duration = inference_result["audio_duration_seconds"]
        segments = inference_result["segments"]
        anomalous_segments = [s for s in segments if s["abnormal_probability"] >= 0.50]

        # 1. Generate Executive Summary
        if classification == "Normal":
            summary = (
                f"Phonocardiogram recording of {duration:.1f}s demonstrates rhythmic S1/S2 acoustic intervals "
                f"with balanced acoustic energy. Overall confidence is {confidence*100:.1f}%. "
                f"No predominant pathological murmur turbulence was detected across the {len(segments)} analyzed segments."
            )
        else:
            if anomalous_segments:
                anom_indices = [str(s["segment_index"]) for s in anomalous_segments]
                time_range = f"between {anomalous_segments[0]['start_time_sec']}s and {anomalous_segments[-1]['end_time_sec']}s"
            else:
                anom_indices = ["borderline murmur turbulence across cardiac windows"]
                time_range = f"throughout the {duration:.1f}s recording"

            summary = (
                f"Phonocardiogram recording of {duration:.1f}s exhibits irregular acoustic energy distribution "
                f"with an abnormal classification confidence of {confidence*100:.1f}%. "
                f"Elevated spectral turbulence was localized in segment(s): {', '.join(anom_indices)} ({time_range})."
            )

        # 2. Detailed Findings Breakdown
        findings: List[Dict[str, Any]] = []

        # Acoustic Energy & Bandwidth
        findings.append({
            "category": "Spectral Frequency Profile (20-200 Hz)",
            "observation": "Acoustic signal filtered via 4th-order zero-phase Butterworth bandpass. Energy within primary cardiac range (20–200 Hz) analyzed for murmur turbulence.",
            "status": "Nominal" if classification == "Normal" else "Elevated Spectral Density"
        })

        # S1/S2 Rhythm Interval Assessment
        findings.append({
            "category": "Cardiac Cycle Regularity",
            "observation": (
                "Regular fundamental Lub-Dub (S1/S2) acoustic timing across recording windows."
                if len(anomalous_segments) == 0 else
                f"Disrupted acoustic envelope observed during systolic/diastolic intervals in {len(anomalous_segments)} segment(s)."
            ),
            "status": "Regular" if len(anomalous_segments) == 0 else "Irregularity Flagged"
        })

        # Segment-by-segment localized notes
        for seg in segments:
            findings.append({
                "category": f"Segment {seg['segment_index']} ({seg['start_time_sec']}s - {seg['end_time_sec']}s)",
                "observation": (
                    f"Normal baseline acoustic envelope (Normal: {seg['normal_probability']*100:.1f}%)."
                    if seg['abnormal_probability'] < 0.5 else
                    f"Acoustic turbulence flagged (Abnormal Score: {seg['abnormal_probability']*100:.1f}%). Requires clinician review."
                ),
                "status": seg["status"],
                "severity_score": seg["severity_score"]
            })

        # 3. Clinical Recommendation Guidance
        if classification == "Normal":
            recommendations = [
                "No urgent phonocardiographic flags detected on current recording.",
                "Maintain standard routine preventive cardiac auscultation.",
                "If patient reports active palpitations or chest discomfort, conduct standard 12-lead ECG."
            ]
        else:
            recommendations = [
                "Recommended follow-up: Stethoscope auscultation over Aortic and Mitral valve areas.",
                "Consider ordering 2D Transthoracic Echocardiogram (TTE) to evaluate valvular gradients and regurgitation.",
                "Review baseline ECG for rhythm abnormalities or bundle branch blocks."
            ]

        raw_report_text = f"## CardioSense Clinical Auscultation Summary\n\n" \
                          f"**Patient/Session**: {patient_tag}\n" \
                          f"**Classification**: {classification} ({confidence*100:.1f}% Confidence)\n\n" \
                          f"### Executive Finding\n{summary}\n\n" \
                          f"### Suggested Clinical Next Steps\n" + \
                          "\n".join([f"- {r}" for r in recommendations])

        # 4. Route through Medical Guardrails & Output Sanitizer
        sanitized_text, guardrail_audit = self.guardrails.sanitize_report(
            raw_text=raw_report_text,
            abnormal_prob=abnormal_prob,
            classification=classification
        )

        return {
            "summary": summary,
            "findings": findings,
            "recommendations": recommendations,
            "full_report_markdown": sanitized_text,
            "guardrail_audit": guardrail_audit,
            "anomalous_segments_count": len(anomalous_segments)
        }
