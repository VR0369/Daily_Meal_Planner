import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme/theme.js';

const ColorModeContext = createContext({ mode: 'light', preference: 'system', setPreference: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function ColorModeProvider({ children }) {
  // preference: 'light' | 'dark' | 'system'
  const [preference, setPreference] = useState(() => localStorage.getItem('mp_theme') || 'system');
  const [systemDark, setSystemDark] = useState(systemPrefersDark());

  useEffect(() => {
    localStorage.setItem('mp_theme', preference);
  }, [preference]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const mode = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, preference, setPreference }), [mode, preference]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
