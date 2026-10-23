import { mapProbabilityToBand } from '../src/constants/thresholds';

describe('mapProbabilityToBand boundary tests', () => {
  test('evaluates 0.34 as NORMAL', () => {
    const res = mapProbabilityToBand(0.34);
    expect(res.category).toBe('NORMAL');
    expect(res.isAbnormal).toBe(false);
  });

  test('evaluates 0.35 boundary as BORDERLINE', () => {
    const res = mapProbabilityToBand(0.35);
    expect(res.category).toBe('BORDERLINE');
    expect(res.isAbnormal).toBe(false);
  });

  test('evaluates 0.489 as BORDERLINE (below tau*)', () => {
    const res = mapProbabilityToBand(0.489);
    expect(res.category).toBe('BORDERLINE');
    expect(res.isAbnormal).toBe(false);
  });

  test('evaluates 0.4900 (tau* optimal decision boundary) as MODERATE_MURMUR', () => {
    const res = mapProbabilityToBand(0.49);
    expect(res.category).toBe('MODERATE_MURMUR');
    expect(res.isAbnormal).toBe(true);
  });

  test('evaluates 0.699 as MODERATE_MURMUR', () => {
    const res = mapProbabilityToBand(0.699);
    expect(res.category).toBe('MODERATE_MURMUR');
    expect(res.isAbnormal).toBe(true);
  });

  test('evaluates 0.700 as SEVERE_ABNORMAL', () => {
    const res = mapProbabilityToBand(0.70);
    expect(res.category).toBe('SEVERE_ABNORMAL');
    expect(res.isAbnormal).toBe(true);
  });
});
