import { BenchmarkSample } from '../api/types';

export const CURATED_BENCHMARKS: BenchmarkSample[] = [
  {
    id: 'a0007',
    title: 'Normal Heart Sound (Sample a0007)',
    condition: 'Normal',
    clinical_context: 'Pristine physiological S1/S2 rhythm, regular 72 BPM cadence, clear systolic/diastolic intervals.',
    duration_sec: 35.7,
    audio_url: '/api/sample-audios/a0007',
  },
  {
    id: 'a0006',
    title: 'Severe Pathological Murmur (Sample a0006)',
    condition: 'Abnormal',
    clinical_context: 'Intense continuous systolic turbulence envelope with marked high-frequency acoustic power (>92% abnormal confidence).',
    duration_sec: 35.0,
    audio_url: '/api/sample-audios/a0006',
  },
  {
    id: 'a0001',
    title: 'Mitral Regurgitation Murmur (Sample a0001)',
    condition: 'Abnormal',
    clinical_context: 'Moderate systolic regurgitation turbulence near optimal decision boundary (54.4% abnormal prob, tau*=0.4900).',
    duration_sec: 35.0,
    audio_url: '/api/sample-audios/a0001',
  },
  {
    id: 'a0003',
    title: 'Holosystolic Murmur (Sample a0003)',
    condition: 'Abnormal',
    clinical_context: 'High-frequency plateau murmur envelope throughout systole with pronounced energy (82.4% abnormal prob).',
    duration_sec: 30.7,
    audio_url: '/api/sample-audios/a0003',
  },
  {
    id: 'a0004',
    title: 'Normal Heart Sound (Sample a0004)',
    condition: 'Normal',
    clinical_context: 'Clear cardiac cycle with healthy lub-dub acoustic signature, 33.3% abnormal prob.',
    duration_sec: 35.0,
    audio_url: '/api/sample-audios/a0004',
  },
];
