const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

/**
 * Sends audio file/blob for DSP analysis, CNN inference, and clinical report generation.
 */
export async function predictHeartSound(audioBlob, filename = 'recording.wav', patientTag = 'Patient #CS-8921') {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('patient_tag', patientTag);

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches real-time DSP preview (Waveform PNG and 128-band Mel-Spectrogram PNG)
 * directly from the uploaded/selected audio file.
 */
export async function fetchDspPreview(audioBlob, filename = 'recording.wav') {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);

  const response = await fetch(`${API_BASE_URL}/api/dsp-preview`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`DSP preview failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches pre-loaded clinical benchmark heart sound samples from PhysioNet dataset.
 */
export async function fetchSampleAudios() {
  const response = await fetch(`${API_BASE_URL}/api/sample-audios`);
  if (!response.ok) {
    throw new Error(`Failed to fetch samples: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches sample audio binary file as a Blob.
 */
export async function fetchSampleAudioBlob(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/sample-audios/${fileId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sample audio: ${response.status}`);
  }
  return await response.blob();
}

/**
 * Fetches patient history logs and previous auscultation records.
 */
export async function fetchHistory(limit = 30) {
  const response = await fetch(`${API_BASE_URL}/api/history?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches complete cryptographic audit log for a specific analysis session.
 */
export async function fetchAuditTrail(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/audit-logs/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch audit trail: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches model performance and clinical gating evaluation metrics.
 */
export async function fetchEvaluationMetrics() {
  const response = await fetch(`${API_BASE_URL}/api/evaluation-metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch evaluation metrics: ${response.status}`);
  }
  return await response.json();
}

/**
 * Checks API server health status.
 */
export async function checkServerHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Server health check failed: ${response.status}`);
  }
  return await response.json();
}
