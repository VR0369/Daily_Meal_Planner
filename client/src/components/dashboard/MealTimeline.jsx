import { keyframes } from '@emotion/react';
import { Box, Typography, Chip, Stack, Paper } from '@mui/material';
import Icon from '../common/Icon.jsx';
import useNow from '../../hooks/useNow.js';
import { MEAL_TYPES, MEAL_META, mealMeta } from '../../utils/constants.js';

const rise = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// `--pulse` is set per-meal so the halo takes the meal's own colour.
const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 var(--pulse); }
  70%  { box-shadow: 0 0 0 12px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

const hourLabel = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

/**
 * The day's meals laid out on a vertical timeline. On today's plan the next
 * upcoming meal is highlighted so the dashboard always points somewhere.
 */
export default function MealTimeline({ meals = [], isToday, onOpen }) {
  const now = useNow(60000);
  const sorted = [...meals].sort(
    (a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType),
  );

  const nextType = isToday
    ? sorted.find((m) => (MEAL_META[m.mealType]?.hour ?? 24) > now.getHours())?.mealType
    : sorted[0]?.mealType;

  return (
    <Stack spacing={0}>
      {sorted.map((meal, i) => {
        const meta = mealMeta(meal.mealType);
        const isNext = meal.mealType === nextType;
        const isPast = isToday && meta.hour <= now.getHours();

        return (
          <Stack
            key={meal.mealType}
            direction="row"
            spacing={2}
            sx={{ animation: `${rise} .45s ease both`, animationDelay: `${i * 70}ms` }}
          >
            {/* Rail */}
            <Stack alignItems="center" sx={{ width: 44, flexShrink: 0 }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  color: '#fff', background: meta.gradient,
                  boxShadow: `0 10px 20px -10px ${meta.color}`,
                  opacity: isPast && !isNext ? 0.5 : 1,
                  '--pulse': meta.color,
                  animation: isNext ? `${pulse} 2.2s ease-out infinite` : 'none',
                }}
              >
                <Icon name={meta.icon} fontSize="small" />
              </Box>
              {i < sorted.length - 1 && (
                <Box
                  sx={{
                    flexGrow: 1, width: 3, minHeight: 24, my: 0.5, borderRadius: 999,
                    background: `linear-gradient(180deg, ${meta.color}, ${mealMeta(sorted[i + 1].mealType).color})`,
                    opacity: 0.45,
                  }}
                />
              )}
            </Stack>

            {/* Card */}
            <Paper
              variant="outlined"
              onClick={onOpen}
              sx={{
                flexGrow: 1, p: 2, mb: 2, cursor: onOpen ? 'pointer' : 'default', borderRadius: '18px',
                borderColor: isNext ? meta.color : 'divider',
                backgroundImage: `linear-gradient(115deg, ${meta.color}1F 0%, transparent 62%)`,
                transition: 'transform .2s cubic-bezier(.2,.8,.3,1), box-shadow .2s ease',
                '&:hover': { transform: 'translateX(6px)', boxShadow: `0 18px 34px -22px ${meta.color}` },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }} flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle2" sx={{ color: meta.color, fontWeight: 800 }}>
                  {meta.emoji} {meal.mealType} · {hourLabel(meta.hour)}
                </Typography>
                {isNext && (
                  <Chip
                    size="small"
                    label={isToday ? 'Up next' : 'First up'}
                    sx={{ background: meta.gradient, color: '#fff' }}
                  />
                )}
                {!meal.mealName && <Chip size="small" variant="outlined" label="Not set" />}
              </Stack>

              <Typography variant="h6" sx={{ opacity: meal.mealName ? 1 : 0.5 }}>
                {meal.mealName || 'Nothing planned yet'}
              </Typography>

              {meal.ingredients?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {meal.ingredients.map((ing) => ing.name).filter(Boolean).join(' · ')}
                </Typography>
              )}
            </Paper>
          </Stack>
        );
      })}
    </Stack>
  );
}
