import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Stack,
  Stepper, Step, StepLabel, Card, CardActionArea, Grid, Checkbox, FormControlLabel,
} from '@mui/material';
import Icon from '../common/Icon.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { DURATIONS, CORE_MEAL_TYPES, OPTIONAL_MEAL_TYPES } from '../../utils/constants.js';

const DURATION_META = {
  Daily: { icon: 'Today', desc: 'Plan a single day' },
  Weekly: { icon: 'ViewWeek', desc: 'Plan seven consecutive days' },
  Monthly: { icon: 'CalendarMonth', desc: 'Plan a whole month on a calendar' },
};

/**
 * Two-step new-plan wizard:
 *  1. "What type of meals would you like?" — category
 *  2. "What planning duration?" — Daily / Weekly / Monthly (+ which meals)
 */
export default function NewPlanDialog({ open, onClose, onCreate, lockDuration }) {
  const { categories } = useApp();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(lockDuration || 'Daily');
  const [mealTypes, setMealTypes] = useState([...CORE_MEAL_TYPES]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setCategory('');
      setDuration(lockDuration || 'Daily');
      setMealTypes([...CORE_MEAL_TYPES]);
    }
  }, [open, lockDuration]);

  const toggleMeal = (type) =>
    setMealTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));

  const finish = () => {
    onCreate({ category, duration, mealTypes });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create a meal plan</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Meal type</StepLabel></Step>
          <Step><StepLabel>Duration</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              What type of meals would you like?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pick a category — we'll tailor AI meal suggestions to it. You can add your own under Meal Categories.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.name}
                  label={cat.name}
                  icon={<Icon name={cat.icon} style={{ fontSize: 18 }} />}
                  onClick={() => setCategory(cat.name)}
                  color={category === cat.name ? 'primary' : 'default'}
                  variant={category === cat.name ? 'filled' : 'outlined'}
                  sx={{ px: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>What planning duration?</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {DURATIONS.map((d) => (
                <Grid item xs={12} sm={4} key={d}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: duration === d ? 'primary.main' : 'divider',
                      borderWidth: duration === d ? 2 : 1,
                    }}
                  >
                    <CardActionArea sx={{ p: 2, textAlign: 'center' }} onClick={() => setDuration(d)}>
                      <Icon name={DURATION_META[d].icon} color={duration === d ? 'primary' : 'action'} sx={{ fontSize: 34 }} />
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>{d}</Typography>
                      <Typography variant="caption" color="text.secondary">{DURATION_META[d].desc}</Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle2" gutterBottom>Which meals?</Typography>
            <Stack direction="row" flexWrap="wrap">
              {[...CORE_MEAL_TYPES, ...OPTIONAL_MEAL_TYPES].map((type) => (
                <FormControlLabel
                  key={type}
                  control={<Checkbox checked={mealTypes.includes(type)} onChange={() => toggleMeal(type)} />}
                  label={type}
                />
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flexGrow: 1 }} />
        {step === 1 && <Button onClick={() => setStep(0)}>Back</Button>}
        {step === 0 && (
          <Button variant="contained" disabled={!category} onClick={() => setStep(1)}>Next</Button>
        )}
        {step === 1 && (
          <Button variant="contained" disabled={mealTypes.length === 0} onClick={finish}>
            Create plan
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
