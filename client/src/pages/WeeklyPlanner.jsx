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
import Loader from '../components/common/Loader.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';
import { todayISO, addDaysISO, toISO, dayName, prettyDate, isTodayISO } from '../utils/dateUtils.js';
import { CORE_MEAL_TYPES, MEAL_TYPES } from '../utils/constants.js';

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
      ? `${prettyDate(toISO(new Date(days[0].date)), { withYear: false })} – ${prettyDate(toISO(new Date(days[6].date)))}`
      : '';

  return (
    <Box>
      <PageHeader
        title="Weekly Planner"
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
            const iso = toISO(new Date(date));
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
                    borderColor: today ? 'primary.main' : 'divider',
                    borderWidth: today ? 2 : 1,
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2">{dayName(iso).slice(0, 3)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(date).getDate()}
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
                      return (
                        <Box key={type} sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">{type}</Typography>
                          <Typography variant="body2" noWrap title={meal?.mealName || ''}>
                            {meal?.mealName || <span style={{ opacity: 0.4 }}>—</span>}
                          </Typography>
                        </Box>
                      );
                    })}
                    {plan?.completion === 'complete' && (
                      <Chip size="small" color="success" label="Complete" sx={{ mt: 0.5 }} />
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
