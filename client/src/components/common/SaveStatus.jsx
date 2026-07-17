import { Box, Typography, CircularProgress } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';

// Small auto-save indicator (no Save button anywhere in the app).
export default function SaveStatus({ status }) {
  if (status === 'idle') return null;
  const map = {
    saving: { icon: <CircularProgress size={14} />, text: 'Saving…', color: 'text.secondary' },
    saved: { icon: <CloudDoneIcon fontSize="small" color="success" />, text: 'All changes saved', color: 'success.main' },
    error: { icon: <CloudOffIcon fontSize="small" color="error" />, text: 'Save failed — retrying', color: 'error.main' },
  };
  const s = map[status] || map.saved;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: s.color }}>
      {s.icon}
      <Typography variant="caption" sx={{ color: s.color }}>{s.text}</Typography>
    </Box>
  );
}
