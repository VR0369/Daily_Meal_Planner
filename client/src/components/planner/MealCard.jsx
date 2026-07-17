import { useState } from 'react';
import {
  Card, CardContent, Box, Typography, TextField, Collapse, IconButton, Chip, Stack, Button, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import IngredientBuilder from './IngredientBuilder.jsx';

const MEAL_META = {
  Breakfast: { icon: 'FreeBreakfast', color: '#ff9800' },
  Lunch: { icon: 'LunchDining', color: '#4caf50' },
  Dinner: { icon: 'DinnerDining', color: '#3f51b5' },
  Snacks: { icon: 'Cookie', color: '#795548' },
  Dessert: { icon: 'Icecream', color: '#e91e63' },
};

/**
 * A single meal (Breakfast/Lunch/Dinner/…). Editing the name, ingredients or
 * notes calls the on* handlers which auto-save upstream.
 */
export default function MealCard({ meal, onNameChange, onIngredientsChange, onNotesChange }) {
  const needed = (meal.ingredients || []).filter((i) => i.status !== 'Available').length;
  const [expanded, setExpanded] = useState(Boolean(meal.mealName));

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center',
              color: '#fff', bgcolor: MEAL_META[meal.mealType]?.color || 'primary.main',
            }}
          >
            <RestaurantIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{meal.mealType}</Typography>
            {meal.ingredients?.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {meal.ingredients.length} ingredient{meal.ingredients.length > 1 ? 's' : ''}
                {needed > 0 ? ` • ${needed} to buy` : ''}
              </Typography>
            )}
          </Box>
          {needed > 0 && <Chip size="small" color="warning" label={`${needed} to buy`} />}
          <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
            <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        <TextField
          fullWidth
          size="small"
          label="Meal name"
          placeholder={`e.g. ${meal.mealType === 'Breakfast' ? 'Vegan Omelette' : 'Paneer Curry'}`}
          value={meal.mealName || ''}
          onChange={(e) => onNameChange(e.target.value)}
        />

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Main ingredients</Typography>
            <IngredientBuilder ingredients={meal.ingredients || []} onChange={onIngredientsChange} />
            <TextField
              fullWidth
              size="small"
              label="Notes"
              multiline
              minRows={2}
              value={meal.notes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </Collapse>

        {!expanded && (
          <Button size="small" sx={{ mt: 1 }} onClick={() => setExpanded(true)}>
            Add ingredients & notes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
