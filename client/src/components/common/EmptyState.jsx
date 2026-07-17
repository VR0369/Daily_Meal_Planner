import { Box, Typography, Button } from '@mui/material';
import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'RestaurantMenu', title, description, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        textAlign: 'center', py: 6, px: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
          display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'primary.main',
        }}
      >
        <Icon name={icon} sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" size="large" startIcon={<Icon name="Add" />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
