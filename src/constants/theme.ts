export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#a5b4fc',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  bgPrimary: '#0f172a',
  bgSurface: '#1e293b',
  bgMuted: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
} as const;

export const DARK = {
  bg: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  card: '#1E293B',
  tabBar: '#0F172A',
  tabBorder: '#1E293B',
} as const;

export const LIGHT = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBorder: '#E2E8F0',
} as const;

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
  tabBar: string;
  tabBorder: string;
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONTS = {
  body: 14,
  bodyLg: 16,
  caption: 12,
  heading: 20,
  headingLg: 24,
  title: 28,
} as const;
