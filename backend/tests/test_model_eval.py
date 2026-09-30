import numpy as np
import pytest
import torch

from backend.training.evaluate import ModelEvaluator
from backend.app.ml.model import CardioSenseCNN


def test_evaluator_metrics_computation():
    """
    Test clinical metric computation: Sensitivity, Specificity, FNR, and Confusion Matrix.
    """
    model = CardioSenseCNN(num_classes=2)
    device = torch.device("cpu")
    evaluator = ModelEvaluator(model, device)

    # 10 samples: 5 Normal (0), 5 Abnormal (1)
    y_true = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])
    # Predictions: 4 TN, 1 FP, 1 FN, 4 TP
    y_pred = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1])
    y_prob = np.array([0.1, 0.2, 0.1, 0.3, 0.7, 0.4, 0.8, 0.9, 0.85, 0.95])

    metrics = evaluator.compute_metrics(y_true, y_pred, y_prob)

    # Sensitivity = TP / (TP + FN) = 4 / (4 + 1) = 0.80
    assert metrics["sensitivity"] == 0.80
    # Specificity = TN / (TN + FP) = 4 / (4 + 1) = 0.80
    assert metrics["specificity"] == 0.80
    # FNR = FN / (TP + FN) = 1 / 5 = 0.20
    assert metrics["false_negative_rate"] == 0.20
    assert metrics["confusion_matrix"]["true_positive"] == 4
    assert metrics["confusion_matrix"]["true_negative"] == 4
    assert metrics["confusion_matrix"]["false_positive"] == 1
    assert metrics["confusion_matrix"]["false_negative"] == 1
    assert metrics["roc_auc"] > 0.80


def test_evaluator_false_negative_safety_gate():
    """
    Regression gate: In medical auscultation, Sensitivity on Abnormal must be prioritized.
    Verifies that a simulated classifier with unacceptably high FNR fails clinical gating.
    """
    model = CardioSenseCNN(num_classes=2)
    evaluator = ModelEvaluator(model, torch.device("cpu"))

    # Model misses too many abnormal heart sounds
    y_true = np.array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    y_pred = np.array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1])  # Missed 6 out of 10
    y_prob = np.array([0.2] * 6 + [0.8] * 4)

    metrics = evaluator.compute_metrics(y_true, y_pred, y_prob)

    # Sensitivity is only 40%, FNR is 60%
    assert metrics["sensitivity"] == 0.40
    assert metrics["false_negative_rate"] == 0.60
