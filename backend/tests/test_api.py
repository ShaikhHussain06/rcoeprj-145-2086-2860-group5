import pytest
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Test /health returns online status and compute device."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "compute_device" in data


def test_evaluation_metrics_endpoint():
    """Test /api/evaluation-metrics returns clinical sensitivity, specificity, and ROC-AUC."""
    response = client.get("/api/evaluation-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "sensitivity_at_optimal" in data["metrics"] or "sensitivity" in data["metrics"]
    assert "specificity_at_optimal" in data["metrics"] or "specificity" in data["metrics"]
    assert "roc_auc" in data["metrics"]


def test_sample_audios_endpoint():
    """Test /api/sample-audios returns benchmark audio samples."""
    response = client.get("/api/sample-audios")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
