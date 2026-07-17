import { createTheme } from '@mui/material/styles';

// Shared shape/typography for both modes. Rounded cards, Inter font, subtle
// elevation — a clean, modern dashboard aesthetic.
const shared = {
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, transition: 'transform .18s ease, box-shadow .18s ease' },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
};

export const getTheme = (mode) =>
  createTheme({
    ...shared,
    palette:
      mode === 'dark'
        ? {
            mode: 'dark',
            primary: { main: '#66bb6a' },
            secondary: { main: '#ffb74d' },
            background: { default: '#0f1416', paper: '#161d21' },
            success: { main: '#66bb6a' },
            warning: { main: '#ffb74d' },
            error: { main: '#ef5350' },
          }
        : {
            mode: 'light',
            primary: { main: '#2e7d32' },
            secondary: { main: '#ef6c00' },
            background: { default: '#f4f7f5', paper: '#ffffff' },
            success: { main: '#2e7d32' },
            warning: { main: '#ed6c02' },
            error: { main: '#d32f2f' },
          },
  });

// Calendar completion colours (mode-aware).
export const completionBg = (level, mode) => {
  const light = { empty: 'transparent', partial: '#fff8e1', complete: '#e8f5e9' };
  const dark = { empty: 'transparent', partial: 'rgba(255,193,7,0.16)', complete: 'rgba(102,187,106,0.18)' };
  return (mode === 'dark' ? dark : light)[level] || 'transparent';
};
