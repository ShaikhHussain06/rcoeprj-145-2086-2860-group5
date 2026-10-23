/**
 * Evaluation metrics from held-out PhysioNet CinC 2016 test set (n=301 recordings).
 * Derived directly from `backend/app/ml/weights/exp3_resnet18_results.json` and HuggingFace Model Card.
 */

export const EVAL_METRICS = {
  modelName: 'CardioResNet-18',
  architecture: '18-Layer Deep Residual CNN (8 Residual Blocks with Skip Connections)',
  dataset: 'PhysioNet / Computing in Cardiology Challenge 2016',
  totalEvaluatedSamples: 301,
  rocAuc: 0.8041,
  optimalThreshold: 0.4900, // Clinically deployed tau* Youden threshold
  sensitivityAtOptimal: 0.8278, // 82.78% (125 / 151 true murmurs detected)
  specificityAtOptimal: 0.6333, // 63.33% (95 / 150 normal hearts confirmed)
  falsePositivesAtOptimal: 55,
  falseNegativesAtOptimal: 26,
  confusionMatrix: {
    truePositive: 125,
    trueNegative: 95,
    falsePositive: 55,
    falseNegative: 26,
  },
  clinicalValidationNote:
    'Evaluated on a zero-leakage patient-split test set. Clinical auscultation recordings require licensed physician correlation.',
} as const;
