import { Box, Typography } from '@mui/material';
import useCountUp from '../../hooks/useCountUp.js';

/**
 * Animated circular progress dial. The stroke sweeps into place and the number
 * counts up alongside it.
 */
export default function ProgressRing({
  value = 0, size = 132, thickness = 10, label = 'complete', color = '#fff',
}) {
  const pct = Math.max(0, Math.min(value, 100));
  const shown = useCountUp(pct, 1100);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box
        component="svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        sx={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.22}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - shown / 100)}
          style={{ transition: 'stroke-dashoffset .25s linear' }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ lineHeight: 1 }}>
            {shown}
            <Typography component="span" variant="h6" sx={{ opacity: 0.75 }}>%</Typography>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>{label}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
