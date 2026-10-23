/**
 * TypeScript API contracts matching CardioSense backend exactly.
 * Derived from docs/API_CONTRACT.md.
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  compute_device: 'cuda' | 'cpu' | string;
  dsp_pipeline: string;
}

export interface BenchmarkSample {
  id: string;
  title: string;
  condition: 'Normal' | 'Abnormal';
  clinical_context: string;
  duration_sec: number;
  audio_url: string;
}

export interface SamplesResponse {
  samples: BenchmarkSample[];
}

export interface SegmentAnalysis {
  segment_index: number;
  start_time_sec: number;
  end_time_sec: number;
  normal_probability: number;
  abnormal_probability: number;
  status: string;
  severity_score: number;
}

export interface InferenceData {
  classification: 'Normal' | 'Abnormal';
  confidence_score: number;
  abnormal_probability: number;
  normal_probability: number;
  audio_duration_seconds: number;
  total_segments: number;
  anomalous_segments_count: number;
  segments: SegmentAnalysis[];
  spectrogram_image: string; // Base64 Data URI
  waveform_image?: string; // Base64 Data URI
}

export interface ClinicalFinding {
  category: string;
  observation: string;
  status: string;
  severity_score?: number;
}

export interface GuardrailAudit {
  all_rules_passed: boolean;
  grounding_check: boolean;
  modifications_applied: string[];
  classification_grounding: string;
  abnormal_prob_grounding: number;
  disclaimer_present: boolean;
}

export interface ClinicalReport {
  summary: string;
  findings: ClinicalFinding[];
  recommendations: string[];
  full_report_markdown: string;
  guardrail_audit: GuardrailAudit;
  anomalous_segments_count: number;
}

export interface PredictResponse {
  status: 'success' | string;
  session_id: string;
  filename: string;
  patient_tag?: string;
  inference: InferenceData;
  clinical_report: ClinicalReport;
}

export interface HistoryItem {
  session_id: string;
  patient_tag: string;
  filename: string;
  duration_seconds: number;
  classification: 'Normal' | 'Abnormal';
  confidence_score: number;
  abnormal_probability: number;
  total_segments: number;
  anomalous_segments_count: number;
  report_summary: string;
  guardrail_passed: boolean;
  created_at: string | null;
}

export interface HistoryResponse {
  count: number;
  history: HistoryItem[];
}

export interface AuditTrailResponse {
  session_id: string;
  audio_sha256: string;
  model_version: string;
  timestamp: string | null;
  dsp_parameters: Record<string, unknown>;
  segment_probabilities: number[][];
  agent_input_payload: Record<string, unknown>;
  raw_agent_output: string;
  sanitized_agent_output: string;
  guardrail_checks: Record<string, unknown>;
}

export interface EvaluationMetricsResponse {
  status: string;
  metrics: {
    experiment?: string;
    model_type: string;
    roc_auc: number;
    optimal_threshold: number;
    sensitivity_at_optimal: number;
    specificity_at_optimal: number;
    false_positives_at_optimal?: number;
    false_negatives_at_optimal?: number;
    confusion_matrix_at_optimal?: {
      true_positive: number;
      true_negative: number;
      false_positive: number;
      false_negative: number;
    };
  };
}
