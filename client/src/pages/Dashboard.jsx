import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Button, Chip, Stack, List, ListItem, ListItemText,
  Divider, LinearProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as api from '../api/endpoints.js';
import StatCard from '../components/common/StatCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import HeroBanner from '../components/dashboard/HeroBanner.jsx';
import MealTimeline from '../components/dashboard/MealTimeline.jsx';
import NewPlanDialog from '../components/planner/NewPlanDialog.jsx';
import useMidnightRefresh from '../hooks/useMidnightRefresh.js';
import { useApp } from '../context/AppContext.jsx';
import { prettyDate, apiISO, todayISO } from '../utils/dateUtils.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [stats, setStats] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activeRes] = await Promise.all([api.getStats(), api.getActiveDay()]);
      setStats(statsRes.data);
      setActive(activeRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Roll over to the next day automatically at midnight.
  useMidnightRefresh(load);

  const handleCreate = async ({ category, duration, mealTypes }) => {
    const date = apiISO(active?.date) || todayISO();
    try {
      await api.createPlan({ date, category, duration, mealTypes });
      setDialogOpen(false);
      notify('Meal plan created');
      if (duration === 'Weekly') navigate('/weekly');
      else if (duration === 'Monthly') navigate('/monthly');
      else navigate(`/daily?date=${date}`);
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (loading) return <Loader label="Loading your dashboard…" />;

  const activeDateISO = apiISO(active?.date) || todayISO();
  const plan = active?.plan;
  const openPlanner = () => navigate(`/daily?date=${activeDateISO}`);

  return (
    <Box>
      <HeroBanner
        dateISO={activeDateISO}
        isToday={active?.isToday}
        completion={stats.completionPercentage}
        mealsPlanned={stats.mealsPlanned}
        mealsRemaining={stats.mealsRemaining}
        onNewPlan={() => setDialogOpen(true)}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Meals Planned" value={stats.mealsPlanned} icon="RestaurantMenu" color="primary" delay={0} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Meals Remaining" value={stats.mealsRemaining} icon="PendingActions" color="warning" delay={80} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Days Completed" value={stats.daysCompleted} icon="EventAvailable" color="success" delay={160} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="Completion"
            value={stats.completionPercentage}
            suffix="%"
            icon="Insights"
            color="secondary"
            progress={stats.completionPercentage}
            delay={240}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h6">
                    {active?.isToday ? "Today's meals" : `Meals for ${prettyDate(activeDateISO)}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your day, in order
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                {plan && (
                  <Button endIcon={<ArrowForwardIcon />} onClick={openPlanner}>
                    Open in planner
                  </Button>
                )}
              </Stack>

              {plan ? (
                <MealTimeline meals={plan.meals} isToday={active?.isToday} onOpen={openPlanner} />
              ) : (
                <EmptyState
                  icon="RestaurantMenu"
                  title={active?.isToday ? 'No plan for today yet' : `No plan for ${prettyDate(activeDateISO)}`}
                  description="Create a plan to see your meals here. It only takes a moment with AI suggestions."
                  actionLabel="Create Today's Meal Plan"
                  onAction={() => setDialogOpen(true)}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <PantryCard
              needed={stats.ingredientsNeeded}
              purchased={stats.ingredientsPurchased}
              onOpen={() => navigate('/grocery')}
            />
            <UpcomingCard upcoming={stats.upcomingMeals} />
          </Stack>
        </Grid>
      </Grid>

      <NewPlanDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate} />
    </Box>
  );
}

/** Shopping progress: how much of the list has actually been bought. */
function PantryCard({ needed, purchased, onOpen }) {
  const total = needed + purchased;
  const pct = total ? Math.round((purchased / total) * 100) : 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6">Grocery progress</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={onOpen}>List</Button>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h4">{purchased}</Typography>
          <Typography variant="body2" color="text.secondary">of {total} items purchased</Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={pct}
          color={pct === 100 ? 'success' : 'warning'}
          sx={{ mt: 1.5, height: 10, borderRadius: 5 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {needed > 0 ? `${needed} still to pick up` : 'Everything on the list is bought'}
        </Typography>
      </CardContent>
    </Card>
  );
}

function UpcomingCard({ upcoming }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Upcoming meals</Typography>
        {upcoming?.length ? (
          <List dense disablePadding>
            {upcoming.map((m, i) => (
              <Box key={`${m.date}-${m.mealType}-${i}`}>
                {i > 0 && <Divider component="li" />}
                <ListItem
                  disableGutters
                  secondaryAction={<Chip size="small" label={m.mealType} variant="outlined" />}
                  sx={{ transition: 'padding .18s ease', '&:hover': { pl: 1 } }}
                >
                  <ListItemText
                    primary={m.mealName}
                    secondary={prettyDate(apiISO(m.date), { withYear: false })}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No upcoming meals planned yet.</Typography>
        )}
      </CardContent>
    </Card>
  );
}
