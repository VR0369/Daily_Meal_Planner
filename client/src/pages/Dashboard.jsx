import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Button, Chip, Stack, List, ListItem, ListItemText, Divider, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import * as api from '../api/endpoints.js';
import StatCard from '../components/common/StatCard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import NewPlanDialog from '../components/planner/NewPlanDialog.jsx';
import useMidnightRefresh from '../hooks/useMidnightRefresh.js';
import { useApp } from '../context/AppContext.jsx';
import { prettyDate, toISO, todayISO } from '../utils/dateUtils.js';
import { MEAL_TYPES } from '../utils/constants.js';

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
    const date = active?.date ? toISO(new Date(active.date)) : todayISO();
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

  const activeDateISO = active?.date ? toISO(new Date(active.date)) : todayISO();
  const plan = active?.plan;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={active?.isToday ? "Here's your plan for today" : `Today is planned — showing ${prettyDate(activeDateISO)}`}
        action={
          <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Meal Plan
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={6} md={3}><StatCard label="Meals Planned" value={stats.mealsPlanned} icon="RestaurantMenu" color="primary" /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Meals Remaining" value={stats.mealsRemaining} icon="PendingActions" color="warning" /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Days Completed" value={stats.daysCompleted} icon="EventAvailable" color="success" /></Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Completion" value={stats.completionPercentage} suffix="%" icon="Insights" color="secondary" progress={stats.completionPercentage} />
        </Grid>
        <Grid item xs={6} md={3}><StatCard label="Ingredients Needed" value={stats.ingredientsNeeded} icon="ShoppingCart" color="warning" /></Grid>
        <Grid item xs={6} md={3}><StatCard label="Ingredients Purchased" value={stats.ingredientsPurchased} icon="CheckCircle" color="success" /></Grid>
        <Grid item xs={12} md={6}>
          <UpcomingCard upcoming={stats.upcomingMeals} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {active?.isToday ? "Today's meals" : `Meals for ${prettyDate(activeDateISO)}`}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                {plan && (
                  <Button onClick={() => navigate(`/daily?date=${activeDateISO}`)}>Open in planner</Button>
                )}
              </Stack>

              {plan ? (
                <Grid container spacing={2}>
                  {[...plan.meals]
                    .sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType))
                    .map((meal) => (
                      <Grid item xs={12} sm={6} md={4} key={meal.mealType}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                          <Chip size="small" label={meal.mealType} color="primary" variant="outlined" sx={{ mb: 1 }} />
                          <Typography variant="subtitle1">{meal.mealName || <em style={{ opacity: 0.6 }}>Not set</em>}</Typography>
                          {meal.ingredients?.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {meal.ingredients.map((i) => i.name).filter(Boolean).join(', ')}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
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
      </Grid>

      <NewPlanDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate} />
    </Box>
  );
}

function UpcomingCard({ upcoming }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Upcoming meals</Typography>
        {upcoming?.length ? (
          <List dense disablePadding>
            {upcoming.map((m, i) => (
              <Box key={`${m.date}-${m.mealType}-${i}`}>
                {i > 0 && <Divider component="li" />}
                <ListItem disableGutters secondaryAction={<Chip size="small" label={m.mealType} variant="outlined" />}>
                  <ListItemText
                    primary={m.mealName}
                    secondary={prettyDate(toISO(new Date(m.date)), { withYear: false })}
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
