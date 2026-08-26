export const colors = {
  background: '#F7F7F5',
  // Same brand system, two quiet backgrounds — a subtle role cue that
  // never competes with the shared white cards or purple accent.
  studentBackground: '#F5F7FF',
  mentorBackground: '#F7F6F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F1EE',

  primary: '#111111',
  onPrimary: '#FFFFFF',

  // The one brand accent — used for primary actions, active nav state,
  // links, and the live indicator. Everything else stays neutral.
  accent: '#635BFF',
  accentBg: '#EEEDFF',

  textPrimary: '#111111',
  textSecondary: '#737373',
  textTertiary: '#9B9B96',

  border: '#E7E7E3',
  borderStrong: '#D6D6D1',

  success: '#1E7F43',
  successBg: '#E7F5EC',
  warning: '#9A6400',
  warningBg: '#FBF1DA',
  info: '#2554C7',
  infoBg: '#E9EFFD',
  error: '#C0392B',
  errorBg: '#FBEAE8',

  overlay: 'rgba(17,17,17,0.5)',
  avatarBg: '#EFEFEC',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
};

export const typography = {
  // Page title
  display: { fontSize: 34, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4 },
  h1: { fontSize: 31, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  h2: { fontSize: 21, fontWeight: '700', color: colors.textPrimary },
  // Card titles
  title: { fontSize: 17, fontWeight: '650', color: colors.textPrimary },
  body: { fontSize: 15.5, fontWeight: '400', color: colors.textPrimary },
  bodyStrong: { fontSize: 15.5, fontWeight: '650', color: colors.textPrimary },
  bodySecondary: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  // Metadata
  caption: { fontSize: 13.5, fontWeight: '400', color: colors.textSecondary },
  // Section headings — uppercase/tracked
  label: { fontSize: 13.5, fontWeight: '650', color: colors.textSecondary, letterSpacing: 0.5 },
};

export const shadow = {
  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  raised: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  hover: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
};

export const layout = {
  maxWidth: 600,
  authMaxWidth: 420,
  wideMaxWidth: 1160,
};
