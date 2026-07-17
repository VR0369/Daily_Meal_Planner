import { useState } from 'react';
import {
  Box, Grid, Stack, Button, Typography, Chip, Menu, MenuItem, Divider, TextField, Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import usePlanEditor from '../../hooks/usePlanEditor.js';
import MealCard from './MealCard.jsx';
import SuggestionDialog from './SuggestionDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';
import SaveStatus from '../common/SaveStatus.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { MEAL_TYPES, CORE_MEAL_TYPES } from '../../utils/constants.js';
import { prettyDate } from '../../utils/dateUtils.js';

/**
 * Editable planner for one day. Handles the "no plan yet" empty state, the meal
 * grid, AI suggestions, adding optional meals, day notes, and the auto-save
 * indicator. Auto-save honours the user's setting.
 */
export default function DayEditor({ dateISO, onChanged }) {
  const { settings, notify } = useApp();
  const autoSave = settings?.autoSave !== false;
  const editor = usePlanEditor(dateISO, { autoSave });
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [addAnchor, setAddAnchor] = useState(null);

  const { plan, loading, saveStatus } = editor;

  if (loading) return <Loader label="Loading plan…" />;

  if (!plan) {
    return (
      <EmptyState
        icon="RestaurantMenu"
        title={`No plan for ${prettyDate(dateISO)}`}
        description="Start planning breakfast, lunch and dinner for this day. You can pull in AI suggestions to fill it fast."
        actionLabel="Create this day's plan"
        onAction={async () => {
          await editor.createPlan({ category: settings?.defaultCategory || '', duration: 'Daily', mealTypes: CORE_MEAL_TYPES });
          onChanged?.();
        }}
      />
    );
  }

  const presentTypes = plan.meals.map((m) => m.mealType);
  const addableTypes = MEAL_TYPES.filter((t) => !presentTypes.includes(t));
  const orderedMeals = [...plan.meals].sort(
    (a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType)
  );

  const handleSave = (fn) => async (...args) => {
    await fn(...args);
    onChanged?.();
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {plan.category && <Chip color="secondary" label={plan.category} />}
        <Chip variant="outlined" label={plan.duration} />
        <Box sx={{ flexGrow: 1 }} />
        <SaveStatus status={saveStatus} />
        <Button
          startIcon={<AutoAwesomeIcon />}
          variant="outlined"
          color="secondary"
          onClick={() => setSuggestOpen(true)}
        >
          AI suggestions
        </Button>
        <Button startIcon={<AddIcon />} onClick={(e) => setAddAnchor(e.currentTarget)} disabled={addableTypes.length === 0}>
          Add meal
        </Button>
        <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)}>
          {addableTypes.map((t) => (
            <MenuItem
              key={t}
              onClick={() => {
                editor.addMealType(t);
                setAddAnchor(null);
              }}
            >
              {t}
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      <Grid container spacing={2}>
        {orderedMeals.map((meal) => (
          <Grid item xs={12} md={6} key={meal.mealType}>
            <MealCard
              meal={meal}
              onNameChange={handleSave((v) => editor.setMealName(meal.mealType, v))}
              onIngredientsChange={handleSave((v) => editor.setIngredients(meal.mealType, v))}
              onNotesChange={handleSave((v) => editor.setMealNotes(meal.mealType, v))}
            />
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Day notes</Typography>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          placeholder="Anything to remember for this day…"
          value={plan.notes || ''}
          onChange={(e) => editor.setNotes(e.target.value)}
        />
      </Paper>

      <SuggestionDialog
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        category={plan.category || settings?.defaultCategory || 'Vegetarian'}
        mealTypes={orderedMeals.map((m) => m.mealType)}
        onAccept={(suggestions) => {
          editor.applySuggestions(suggestions);
          notify('AI suggestions added');
          onChanged?.();
        }}
      />
    </Box>
  );
}
