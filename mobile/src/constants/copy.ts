export const COPY = {
  appName: 'CardioSense AI',
  tagline: 'Phonocardiogram (PCG) Acoustic Screening & Decision Support',
  subtitle: 'Automated murmur detection and auscultation analytics powered by CardioResNet-18',

  // Mandatory statutory disclaimer required on all clinical reports & screens
  mandatoryDisclaimer:
    'CardioSense is an automated acoustic screening and decision-support tool. It does not provide a definitive diagnosis. All findings must be clinically correlated with stethoscope auscultation and echocardiography by a licensed clinician.',

  // Live recording notice regarding acoustic transducer differences
  phoneMicNotice:
    'Phone microphones differ acoustically from the medical electronic stethoscopes used during model training. Results from phone-mic recordings are for demonstration and screening purposes only.',

  // Guardrail guidance
  intendedUse:
    'Investigational cardiac acoustic decision support for primary screening triage. Not cleared for autonomous diagnosis.',
} as const;
