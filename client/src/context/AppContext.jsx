import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import * as api from '../api/endpoints.js';
import { FALLBACK_CATEGORIES } from '../utils/constants.js';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [categories, setCategories] = useState(
    FALLBACK_CATEGORIES.map((name) => ({ name, color: '#90a4ae', icon: 'Restaurant' }))
  );
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await api.getCategories();
      if (data?.length) setCategories(data);
    } catch (e) {
      // keep fallback categories
      console.warn('Could not load categories:', e.message);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await api.getSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Could not load settings:', e.message);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadSettings();
  }, [loadCategories, loadSettings]);

  const saveSettings = useCallback(
    async (patch) => {
      const { data } = await api.updateSettings(patch);
      setSettings(data);
      return data;
    },
    []
  );

  const weekStartsOn = settings?.weekStartsOn === 'Sunday' ? 0 : 1;

  const value = useMemo(
    () => ({
      categories,
      loadCategories,
      settings,
      saveSettings,
      loadSettings,
      weekStartsOn,
      notify,
    }),
    [categories, loadCategories, settings, saveSettings, loadSettings, weekStartsOn, notify]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
}
