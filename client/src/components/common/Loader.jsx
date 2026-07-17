import { Box, CircularProgress, Typography } from '@mui/material';

export default function Loader({ label = 'Loading…', minHeight = 240 }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight, gap: 1.5 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
}
