import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, TextField, MenuItem, Switch, FormControlLabel, Divider, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import PageHeader from '../components/common/PageHeader.jsx';
import Loader from '../components/common/Loader.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useColorMode } from '../context/ColorModeContext.jsx';
import { DURATIONS } from '../utils/constants.js';

export default function Settings() {
  const { settings, saveSettings, categories, notify } = useApp();
  const { preference, setPreference } = useColorMode();
  const [local, setLocal] = useState(settings);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  if (!local) return <Loader label="Loading settings…" />;

  const update = async (patch) => {
    setLocal((l) => ({ ...l, ...patch }));
    try {
      await saveSettings(patch);
      notify('Settings saved');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Preferences are saved automatically" />

      <Stack spacing={2} sx={{ maxWidth: 680 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Appearance</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose light, dark, or match your system.</Typography>
            <ToggleButtonGroup
              exclusive
              value={preference}
              onChange={(_, v) => {
                if (!v) return;
                setPreference(v);
                update({ theme: v });
              }}
            >
              <ToggleButton value="light"><LightModeIcon sx={{ mr: 1 }} /> Light</ToggleButton>
              <ToggleButton value="dark"><DarkModeIcon sx={{ mr: 1 }} /> Dark</ToggleButton>
              <ToggleButton value="system"><SettingsBrightnessIcon sx={{ mr: 1 }} /> System</ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Planning defaults</Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Default category"
                value={local.defaultCategory || ''}
                onChange={(e) => update({ defaultCategory: e.target.value })}
              >
                {categories.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Default duration"
                value={local.defaultDuration || 'Daily'}
                onChange={(e) => update({ defaultDuration: e.target.value })}
              >
                {DURATIONS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Week starts on"
                value={local.weekStartsOn || 'Monday'}
                onChange={(e) => update({ weekStartsOn: e.target.value })}
              >
                <MenuItem value="Monday">Monday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Meals & saving</Typography>
            <Stack sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={!!local.includeSnacks} onChange={(e) => update({ includeSnacks: e.target.checked })} />}
                label="Include Snacks by default"
              />
              <FormControlLabel
                control={<Switch checked={!!local.includeDessert} onChange={(e) => update({ includeDessert: e.target.checked })} />}
                label="Include Dessert by default"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={<Switch checked={local.autoSave !== false} onChange={(e) => update({ autoSave: e.target.checked })} />}
                label="Auto-save meal edits (recommended)"
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
