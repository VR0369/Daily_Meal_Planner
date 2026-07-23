import { createTheme } from '@mui/material/styles';

/**
 * Vibrant, high-energy palette — electric violet lead with hot pink, cyan and
 * mango accents. Every semantic colour is a saturated hue so charts, chips and
 * cards across the app read as one bright system in both modes.
 */
const HUES = {
  primary: { main: '#7C4DFF', light: '#A98BFF', dark: '#5A21D6' },
  secondary: { main: '#FF2E93', light: '#FF6CB4', dark: '#C4006A' },
  success: { main: '#00C48C', light: '#4BE3B6', dark: '#00916A' },
  warning: { main: '#FF9F1A', light: '#FFC15E', dark: '#D97A00' },
  error: { main: '#FF4D6D', light: '#FF869A', dark: '#D01C40' },
  info: { main: '#00C2FF', light: '#5DDBFF', dark: '#0091C4' },
};

/** Reusable gradients — the app's signature look. */
export const GRADIENTS = {
  brand: 'linear-gradient(135deg, #7C4DFF 0%, #FF2E93 100%)',
  sunrise: 'linear-gradient(135deg, #FF9F1A 0%, #FF2E93 100%)',
  ocean: 'linear-gradient(135deg, #00C2FF 0%, #7C4DFF 100%)',
  mint: 'linear-gradient(135deg, #00C48C 0%, #00C2FF 100%)',
  berry: 'linear-gradient(135deg, #FF2E93 0%, #7C4DFF 100%)',
  candy: 'linear-gradient(135deg, #FF2E93 0%, #FF9F1A 60%, #00C2FF 100%)',
};

/** Gradient for a palette key, used by cards, avatars and stat tiles. */
export const gradientFor = (key = 'primary') => {
  const hue = HUES[key] || HUES.primary;
  return `linear-gradient(135deg, ${hue.light} 0%, ${hue.main} 55%, ${hue.dark} 100%)`;
};

/** Translucent tint of a hue — for soft chip/card backgrounds. */
export const tint = (key, alpha = 0.12) => {
  const hex = (HUES[key] || HUES.primary).main.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Shared shape/typography for both modes: chunky radii, a display face for
// headings and playful, confident weights.
const shared = {
  // Keep the base modest — `sx` multiplies it, so a large base turns
  // borderRadius: 3 into a pill. Components that want more state it in px.
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h3: { fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: -1 },
    h4: { fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: -0.8 },
    h5: { fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: -0.4 },
    h6: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0.1 },
    caption: { fontWeight: 500 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: 'transform .22s cubic-bezier(.2,.8,.3,1), box-shadow .22s ease, border-color .22s ease',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18 },
        // The primary CTA everywhere becomes the brand gradient.
        containedPrimary: {
          background: GRADIENTS.brand,
          boxShadow: '0 8px 20px -8px rgba(124,77,255,.9)',
          '&:hover': { background: GRADIENTS.brand, filter: 'brightness(1.08)' },
        },
        containedSecondary: {
          background: GRADIENTS.sunrise,
          '&:hover': { background: GRADIENTS.sunrise, filter: 'brightness(1.08)' },
        },
        outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700, borderRadius: 999 } } },
    MuiLinearProgress: {
      styleOverrides: {
        // A neutral track keeps a low percentage from reading as a full bar.
        root: { borderRadius: 999, backgroundColor: 'rgba(124,77,255,.14)' },
        bar: { borderRadius: 999 },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 10, fontWeight: 600 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },
  },
};

export const getTheme = (mode) =>
  createTheme({
    ...shared,
    palette:
      mode === 'dark'
        ? {
            mode: 'dark',
            ...HUES,
            background: { default: '#0B0713', paper: '#160F26' },
            divider: 'rgba(255,255,255,.10)',
          }
        : {
            mode: 'light',
            ...HUES,
            background: { default: '#F6F4FF', paper: '#FFFFFF' },
            divider: 'rgba(124,77,255,.14)',
          },
  });

// Calendar completion colours (mode-aware).
export const completionBg = (level, mode) => {
  const light = { empty: 'transparent', partial: 'rgba(255,159,26,.18)', complete: 'rgba(0,196,140,.20)' };
  const dark = { empty: 'transparent', partial: 'rgba(255,159,26,.22)', complete: 'rgba(0,196,140,.24)' };
  return (mode === 'dark' ? dark : light)[level] || 'transparent';
};
