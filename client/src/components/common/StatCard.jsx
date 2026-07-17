import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import Icon from './Icon.jsx';

export default function StatCard({ label, value, icon, color = 'primary', suffix = '', progress }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center',
              bgcolor: (t) => t.palette[color]?.main, color: '#fff',
            }}
          >
            <Icon name={icon} fontSize="small" />
          </Box>
        </Box>
        <Typography variant="h4">
          {value}
          {suffix && <Typography component="span" variant="h6" color="text.secondary">{suffix}</Typography>}
        </Typography>
        {typeof progress === 'number' && (
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            color={color}
            sx={{ mt: 1.5, height: 8, borderRadius: 5 }}
          />
        )}
      </CardContent>
    </Card>
  );
}
