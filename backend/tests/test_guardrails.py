import pytest
from backend.app.agent.guardrails import MedicalGuardrails


def test_guardrails_anti_overclaiming():
    """
    Test that definitive medical claims like 'You have heart failure'
    are rewritten into safe descriptive acoustic findings.
    """
    guardrails = MedicalGuardrails()
    raw_text = "The analysis is complete. You have heart failure and severe aortic stenosis. This is a confirmed case of valvular disease."
    sanitized, audit = guardrails.sanitize_report(raw_text, abnormal_prob=0.85, classification="Abnormal")

    assert "you have heart failure" not in sanitized.lower()
    assert "acoustic patterns indicate potential signs of heart failure" in sanitized.lower()
    assert "the analysis suggests characteristics of" in sanitized.lower()
    assert "Clinical Advisory Disclaimer" in sanitized
    assert len(audit["modifications_applied"]) > 0


def test_guardrails_grounding_filter():
    """
    Test that high-risk murmur claims are suppressed if the CNN predicted Normal (<0.35 abnormal prob).
    """
    guardrails = MedicalGuardrails()
    raw_text = "The heart exhibits severe pathology and critical murmur signatures."
    sanitized, audit = guardrails.sanitize_report(raw_text, abnormal_prob=0.10, classification="Normal")

    assert "severe pathology" not in sanitized.lower()
    assert "critical murmur" not in sanitized.lower()
    assert "benign acoustic variance" in sanitized.lower()
    assert audit["grounding_check"] is False  # Flagged grounding correction
