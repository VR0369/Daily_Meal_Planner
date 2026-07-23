import { keyframes } from '@emotion/react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ProgressRing from './ProgressRing.jsx';
import useNow from '../../hooks/useNow.js';
import { prettyDate } from '../../utils/dateUtils.js';

// Slow-drifting light blobs give the banner a sense of motion without distracting.
const drift = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(6%, -10%, 0) scale(1.15); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// The banner's gradient slowly slides across its hues.
const shift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function greeting(hour) {
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

// A rotating line of encouragement keeps the hero feeling alive.
const HYPE = [
  "let's eat well. 🔥",
  'fuel up right. ⚡',
  'your kitchen, your rules. 👩‍🍳',
  'good food, zero stress. 🌈',
  'make today delicious. 🍽️',
];

/**
 * The dashboard's opening statement: time-aware greeting, a live clock, the
 * day's completion dial and the primary call to action.
 */
export default function HeroBanner({ dateISO, isToday, completion, mealsPlanned, mealsRemaining, onNewPlan }) {
  const now = useNow(1000);
  const clock = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '28px',
        p: { xs: 3, md: 4 },
        mb: 3,
        color: '#fff',
        animation: `${rise} .5s ease both, ${shift} 18s ease-in-out infinite`,
        background: 'linear-gradient(115deg, #7C4DFF 0%, #B14BFF 22%, #FF2E93 48%, #FF6A3D 72%, #FF9F1A 100%)',
        backgroundSize: '260% 260%',
        boxShadow: '0 24px 50px -24px rgba(124,77,255,.95)',
      }}
    >
      {/* Decorative glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute', top: '-40%', right: '-8%', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 70%)',
          animation: `${drift} 14s ease-in-out infinite`, pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute', bottom: '-55%', left: '12%', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,.42) 0%, rgba(0,229,255,0) 70%)',
          animation: `${drift} 18s ease-in-out infinite reverse`, pointerEvents: 'none',
        }}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ position: 'relative' }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={clock}
              sx={{ bgcolor: 'rgba(255,255,255,.18)', color: '#fff', backdropFilter: 'blur(4px)' }}
            />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isToday ? prettyDate(dateISO) : `Next open day · ${prettyDate(dateISO)}`}
            </Typography>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, fontSize: { xs: 30, md: 42 } }}>
            {greeting(now.getHours())} — {HYPE[now.getDay() % HYPE.length]}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, mt: 1 }}>
            {mealsRemaining > 0
              ? `${mealsPlanned} meals planned, ${mealsRemaining} still waiting on you.`
              : `${mealsPlanned} meals planned. Everything's covered.`}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={onNewPlan}
              sx={{
                bgcolor: '#fff', color: 'secondary.dark', fontWeight: 800,
                boxShadow: '0 12px 26px -12px rgba(0,0,0,.55)',
                '&:hover': { bgcolor: '#fff', transform: 'translateY(-3px) scale(1.03)' },
                transition: 'transform .18s cubic-bezier(.2,.8,.3,1)',
              }}
            >
              New Meal Plan
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AutoAwesomeIcon />}
              onClick={onNewPlan}
              sx={{
                color: '#fff', borderColor: 'rgba(255,255,255,.65)', fontWeight: 800,
                backdropFilter: 'blur(6px)', bgcolor: 'rgba(255,255,255,.10)',
                transition: 'transform .18s ease',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.22)', transform: 'translateY(-3px)' },
              }}
            >
              Suggest for me
            </Button>
          </Stack>
        </Box>

        <ProgressRing value={completion} label="day complete" />
      </Stack>
    </Box>
  );
}
