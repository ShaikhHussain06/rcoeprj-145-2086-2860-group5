export const Theme = {
  colors: {
    // Primary Brand (Sky / Cyan Blue palette from web app)
    primary: '#0284c7', // Sky-600
    primaryLight: '#38bdf8', // Sky-400
    primaryDark: '#0369a1', // Sky-700
    primaryMuted: '#e0f2fe', // Sky-100

    // Background & Surfaces
    background: '#f8fafc', // Slate-50
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9', // Slate-100
    surfaceDark: '#0b0f19', // Dark navy used for spectrogram/waveform displays
    border: '#e2e8f0', // Slate-200
    borderStrong: '#cbd5e1', // Slate-300

    // Text & Typography
    textPrimary: '#0f172a', // Slate-900 (Dark navy)
    textSecondary: '#475569', // Slate-600
    textMuted: '#94a3b8', // Slate-400
    textInverse: '#ffffff',

    // Clinical Banding & Semantic Indicators
    normal: '#16a34a', // Emerald-600 (Normal Rhythm)
    normalMuted: '#dcfce7', // Emerald-100
    borderline: '#d97706', // Amber-600 (Borderline / Murmur Jet)
    borderlineMuted: '#fef3c7', // Amber-100
    abnormal: '#dc2626', // Red-600 (Marked Murmur Turbulence)
    abnormalMuted: '#fee2e2', // Red-100

    // UI Badges
    badgeOnline: '#22c55e',
    badgeOffline: '#ef4444',
  },
  typography: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
} as const;

export type AppTheme = typeof Theme;
