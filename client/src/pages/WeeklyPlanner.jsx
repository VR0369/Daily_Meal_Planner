import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Stack, Chip, Divider, Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import PageHeader from '../components/common/PageHeader.jsx';
import { GRADIENTS } from '../theme/theme.js';
import Loader from '../components/common/Loader.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';
import { todayISO, addDaysISO, apiISO, fromISO, dayName, prettyDate, isTodayISO } from '../utils/dateUtils.js';
import { CORE_MEAL_TYPES, MEAL_TYPES, mealMeta } from '../utils/constants.js';

export default function WeeklyPlanner() {
  const navigate = useNavigate();
  const { weekStartsOn, notify } = useApp();
  const [anchorISO, setAnchorISO] = useState(todayISO());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getWeek(anchorISO, weekStartsOn === 0 ? 'Sunday' : 'Monday');
      setDays(data);
    } finally {
      setLoading(false);
    }
  }, [anchorISO, weekStartsOn]);

  useEffect(() => {
    load();
  }, [load]);

  const copyWeek = async () => {
    try {
      const nextWeek = addDaysISO(anchorISO, 7);
      await api.copyWeek(anchorISO, nextWeek, weekStartsOn === 0 ? 'Sunday' : 'Monday');
      notify('Copied this week to next week');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const rangeLabel =
    days.length === 7
      ? `${prettyDate(apiISO(days[0].date), { withYear: false })} – ${prettyDate(apiISO(days[6].date))}`
      : '';

  return (
    <Box>
      <PageHeader
        title="Weekly Planner"
        gradient={GRADIENTS.mint}
        subtitle={rangeLabel}
        action={
          <Tooltip title="Duplicate this week's meals into next week">
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyWeek}>
              Copy week forward
            </Button>
          </Tooltip>
        }
      />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => setAnchorISO(addDaysISO(anchorISO, -7))}><ChevronLeftIcon /></IconButton>
        <IconButton onClick={() => setAnchorISO(addDaysISO(anchorISO, 7))}><ChevronRightIcon /></IconButton>
        <Button size="small" startIcon={<TodayIcon />} onClick={() => setAnchorISO(todayISO())}>This week</Button>
      </Stack>

      {loading ? (
        <Loader label="Loading week…" />
      ) : (
        <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 7 }}>
          {days.map(({ date, plan }) => {
            const iso = apiISO(date);
            const today = isTodayISO(iso);
            const meals = plan?.meals
              ? [...plan.meals].sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType))
              : [];
            return (
              <Grid item xs={1} key={iso} sx={{ minWidth: { md: 150 } }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderColor: today ? 'secondary.main' : 'divider',
                    borderWidth: today ? 2 : 1,
                    // Today's column glows; the rest stay calm so it stands out.
                    backgroundImage: today
                      ? 'linear-gradient(160deg, rgba(255,46,147,.16), rgba(124,77,255,.06))'
                      : 'none',
                    boxShadow: today ? '0 18px 36px -24px rgba(255,46,147,.9)' : 'none',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" color={today ? 'secondary.main' : 'text.primary'}>
                          {dayName(iso).slice(0, 3)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fromISO(iso).getDate()}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton size="small" onClick={() => navigate(`/daily?date=${iso}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Divider sx={{ mb: 1 }} />
                    {CORE_MEAL_TYPES.map((type) => {
                      const meal = meals.find((m) => m.mealType === type);
                      const meta = mealMeta(type);
                      return (
                        <Box
                          key={type}
                          sx={{
                            mb: 1, pl: 1, borderLeft: '3px solid', borderColor: meta.color,
                            borderRadius: '0 8px 8px 0',
                            bgcolor: meal?.mealName ? `${meta.color}14` : 'transparent',
                          }}
                        >
                          <Typography variant="caption" display="block" sx={{ color: meta.color, fontWeight: 700 }}>
                            {meta.emoji} {type}
                          </Typography>
                          <Typography variant="body2" noWrap title={meal?.mealName || ''}>
                            {meal?.mealName || <span style={{ opacity: 0.4 }}>—</span>}
                          </Typography>
                        </Box>
                      );
                    })}
                    {plan?.completion === 'complete' && (
                      <Chip size="small" color="success" label="✓ Complete" sx={{ mt: 0.5, color: '#fff' }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
