import re
from typing import Dict, Any, List, Tuple


class MedicalGuardrails:
    """
    CardioSense Medical Guardrails & Output Sanitization Layer:
    - Enforces Anti-Overclaiming: Replaces definitive diagnostic declarations with descriptive acoustic observations.
    - Grounding Check: Ensures clinical text is strictly faithful to CNN probability distributions.
    - Disclaimer Injection: Automatically attaches mandatory clinical research disclaimers.
    """

    INVESTIGATIONAL_DISCLAIMER = (
        "**Clinical Advisory Disclaimer**: CardioSense is an automated acoustic screening and investigational "
        "decision-support tool. It does not provide a definitive medical diagnosis. All phonocardiogram "
        "findings must be correlated with clinical history, standard stethoscope auscultation, and "
        "echocardiography by a licensed healthcare professional."
    )

    # Disallowed definitive diagnostic phrases
    FORBIDDEN_DIAGNOSES = [
        (r"\byou have (heart failure|aortic stenosis|mitral regurgitation|cardiac disease|an infarction)\b",
         "acoustic patterns indicate potential signs of \\1"),
        (r"\bthe patient has (heart failure|aortic stenosis|mitral regurgitation|cardiac disease)\b",
         "the recording presents acoustic signatures consistent with \\1"),
        (r"\bthis is a confirmed case of\b", "the analysis suggests characteristics of"),
        (r"\bdefinitely abnormal\b", "exhibits characteristics of an abnormal acoustic rhythm"),
        (r"\bdefinitely normal\b", "exhibits characteristics consistent with normal acoustic rhythm"),
        (r"\bno medical attention is needed\b", "regular clinical checkups remain advised"),
        (r"\bdiagnostic conclusion:\s*", "Acoustic Finding: "),
    ]

    def sanitize_report(
        self,
        raw_text: str,
        abnormal_prob: float,
        classification: str
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Sanitizes the generated clinical report against medical safety guardrails.
        Returns:
            sanitized_text: Safe, non-overclaiming report.
            guardrail_metadata: Audit trail documenting all rule checks and modifications.
        """
        modifications: List[str] = []
        text = raw_text

        # Rule 1: Anti-Overclaiming & Diagnosis Sanitization
        for pattern, replacement in self.FORBIDDEN_DIAGNOSES:
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            if matches:
                modifications.append(f"Substituted definitive claim pattern: '{pattern}'")
                text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # Rule 2: Metric Grounding & Hallucination Prevention
        grounding_passed = True
        # If CNN says definitely Normal (<0.35 abnormal), prevent text from asserting high risk
        if abnormal_prob < 0.35:
            high_risk_words = ["critical murmur", "severe pathology", "high cardiac risk", "pathological turbulence"]
            for word in high_risk_words:
                if word in text.lower():
                    grounding_passed = False
                    modifications.append(f"Grounding violation: Suppressed '{word}' because abnormal probability is low ({abnormal_prob:.2f})")
                    text = text.replace(word, "benign acoustic variance")

        # If CNN says Abnormal (>0.65), prevent text from asserting completely normal status
        if abnormal_prob > 0.65:
            false_benign_words = ["perfect heart rhythm", "completely healthy heart", "zero abnormalities"]
            for word in false_benign_words:
                if word in text.lower():
                    grounding_passed = False
                    modifications.append(f"Grounding violation: Suppressed '{word}' because abnormal probability is elevated ({abnormal_prob:.2f})")
                    text = text.replace(word, "regular baseline segments with isolated anomalous regions")

        # Rule 3: Mandatory Disclaimer Injection
        has_disclaimer = "disclaimer" in text.lower()
        if not has_disclaimer:
            text = f"{text.strip()}\n\n---\n{self.INVESTIGATIONAL_DISCLAIMER}"
            modifications.append("Appended standard investigational clinical disclaimer")

        guardrail_metadata = {
            "all_rules_passed": len(modifications) == 1 and "Appended standard" in modifications[0],
            "grounding_check": grounding_passed,
            "modifications_applied": modifications,
            "classification_grounding": classification,
            "abnormal_prob_grounding": round(abnormal_prob, 4),
            "disclaimer_present": True
        }

        return text, guardrail_metadata
