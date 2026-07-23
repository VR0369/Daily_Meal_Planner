import { useState } from 'react';
import {
  Card, CardContent, Box, Typography, TextField, Collapse, IconButton, Chip, Stack, Button, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IngredientBuilder from './IngredientBuilder.jsx';
import Icon from '../common/Icon.jsx';
import { mealMeta } from '../../utils/constants.js';

/**
 * A single meal (Breakfast/Lunch/Dinner/…). Editing the name, ingredients or
 * notes calls the on* handlers which auto-save upstream.
 */
export default function MealCard({ meal, onNameChange, onIngredientsChange, onNotesChange }) {
  const needed = (meal.ingredients || []).filter((i) => i.status !== 'Available').length;
  const [expanded, setExpanded] = useState(Boolean(meal.mealName));
  const meta = mealMeta(meal.mealType);

  return (
    <Card
      variant="outlined"
      sx={{
        // Each meal type owns a colour — the card wears it on its top edge and wash.
        borderTop: '4px solid', borderTopColor: meta.color,
        backgroundImage: `linear-gradient(160deg, ${meta.color}14 0%, transparent 55%)`,
        '&:hover': { boxShadow: `0 20px 40px -26px ${meta.color}` },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center',
              color: '#fff', background: meta.gradient,
              boxShadow: `0 10px 20px -10px ${meta.color}`,
            }}
          >
            <Icon name={meta.icon} fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{meta.emoji} {meal.mealType}</Typography>
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
