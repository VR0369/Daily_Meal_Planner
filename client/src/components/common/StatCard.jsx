import { keyframes } from '@emotion/react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import Icon from './Icon.jsx';
import useCountUp from '../../hooks/useCountUp.js';
import { gradientFor, tint } from '../../theme/theme.js';

const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/**
 * A single headline number. Numeric values count up on mount; `delay` staggers
 * the entrance so a row of cards cascades in.
 */
export default function StatCard({ label, value, icon, color = 'primary', suffix = '', progress, delay = 0 }) {
  const numeric = typeof value === 'number';
  const counted = useCountUp(numeric ? value : 0);
  const countedProgress = useCountUp(typeof progress === 'number' ? progress : 0);
  const shown = numeric ? counted : value;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderColor: tint(color, 0.35),
        backgroundImage: `linear-gradient(150deg, ${tint(color, 0.16)} 0%, ${tint(color, 0.02)} 60%)`,
        animation: `${rise} .5s ease both`,
        animationDelay: `${delay}ms`,
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (t) => `0 22px 40px -22px ${t.palette[color]?.main}`,
          borderColor: (t) => t.palette[color]?.main,
        },
        // Accent rail that widens on hover.
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: gradientFor(color),
          transition: 'width .18s ease',
        },
        '&:hover::before': { width: 9 },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 42, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#fff',
              background: gradientFor(color),
              boxShadow: (t) => `0 10px 20px -10px ${t.palette[color]?.main}`,
            }}
          >
            <Icon name={icon} fontSize="small" />
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{
            background: gradientFor(color),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {shown}
          {suffix && <Typography component="span" variant="h6">{suffix}</Typography>}
        </Typography>
        {typeof progress === 'number' && (
          <LinearProgress
            variant="determinate"
            value={Math.min(countedProgress, 100)}
            color={color}
            sx={{ mt: 1.5, height: 8, borderRadius: 5 }}
          />
        )}
      </CardContent>
    </Card>
  );
}
