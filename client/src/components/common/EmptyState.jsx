import { keyframes } from '@emotion/react';
import { Box, Typography, Button } from '@mui/material';
import Icon from './Icon.jsx';
import { GRADIENTS } from '../../theme/theme.js';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

export default function EmptyState({ icon = 'RestaurantMenu', title, description, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        textAlign: 'center', py: 6, px: 3, borderRadius: '24px', border: '2px dashed',
        borderColor: 'primary.light',
        backgroundImage: 'linear-gradient(160deg, rgba(124,77,255,.08), rgba(255,46,147,.05))',
      }}
    >
      <Box
        sx={{
          width: 76, height: 76, borderRadius: '50%', mx: 'auto', mb: 2,
          display: 'grid', placeItems: 'center', background: GRADIENTS.brand, color: '#fff',
          boxShadow: '0 18px 34px -16px rgba(124,77,255,.9)',
          animation: `${float} 3.4s ease-in-out infinite`,
        }}
      >
        <Icon name={icon} sx={{ fontSize: 36 }} />
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
