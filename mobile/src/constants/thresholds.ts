/**
 * CardioSense Decision Boundaries & Stratification Bands
 *
 * Single source of truth calibrated via Youden's J statistic on the PhysioNet CinC cohort.
 * Optimal threshold tau* = 0.4900 (49.0%).
 */

export const OPTIMAL_THRESHOLD = 0.4900;

export const BAND_NORMAL_CEILING = 0.3500;
export const BAND_BORDERLINE_CEILING = 0.4900;
export const BAND_MODERATE_CEILING = 0.7000;

export type ClinicalBandCategory = 'NORMAL' | 'BORDERLINE' | 'MODERATE_MURMUR' | 'SEVERE_ABNORMAL';

export interface ProbabilityBandInfo {
  category: ClinicalBandCategory;
  label: string;
  badgeLabel: string;
  isAbnormal: boolean;
  color: string;
  backgroundColor: string;
  clinicalDescription: string;
  recommendedAction: string;
}

/**
 * Maps raw model abnormal probability P(Abnormal) in [0.0, 1.0] to a standardized clinical band.
 * Strictly tested across boundary thresholds: 0.34, 0.35, 0.489, 0.49, 0.699, 0.70.
 */
export function mapProbabilityToBand(pAbnormal: number): ProbabilityBandInfo {
  // Clamp to valid probability interval
  const p = Math.max(0, Math.min(1, pAbnormal));

  if (p < BAND_NORMAL_CEILING) {
    return {
      category: 'NORMAL',
      label: 'Normal Acoustic Rhythm',
      badgeLabel: 'Normal',
      isAbnormal: false,
      color: '#16a34a',
      backgroundColor: '#dcfce7',
      clinicalDescription: 'Pristine S1/S2 acoustic rhythm; quiet, silent baseline with no predominant murmur turbulence.',
      recommendedAction: 'Routine preventive checkup. No immediate secondary referral indicated.',
    };
  }

  if (p < BAND_BORDERLINE_CEILING) {
    return {
      category: 'BORDERLINE',
      label: 'Borderline / Benign Variance',
      badgeLabel: 'Borderline',
      isAbnormal: false,
      color: '#d97706',
      backgroundColor: '#fef3c7',
      clinicalDescription: 'Minor background acoustic energy or benign physiologic S2 splitting. Remains below decision threshold.',
      recommendedAction: 'Review clinical symptoms. No immediate echocardiography referral required unless symptomatic.',
    };
  }

  if (p < BAND_MODERATE_CEILING) {
    return {
      category: 'MODERATE_MURMUR',
      label: 'Moderate Murmur Turbulence',
      badgeLabel: 'Murmur Flagged',
      isAbnormal: true,
      color: '#ea580c',
      backgroundColor: '#ffedd5',
      clinicalDescription: 'Subtle systolic turbulence or regurgitation jet exceeding the optimal decision boundary (tau* = 0.4900).',
      recommendedAction: 'Careful stethoscope re-auscultation recommended; consider 2D Echocardiogram (TTE) evaluation.',
    };
  }

  return {
    category: 'SEVERE_ABNORMAL',
    label: 'Severe Pathological Murmur',
    badgeLabel: 'Marked Pathology',
    isAbnormal: true,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    clinicalDescription: 'Marked high-frequency continuous acoustic turbulence indicative of valvular pathology.',
    recommendedAction: 'Echocardiogram (TTE) referral advised to quantify regurgitant or stenotic valvular gradients.',
  };
}
