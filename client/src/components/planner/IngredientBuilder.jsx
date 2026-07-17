import {
  Box, TextField, MenuItem, Stack, IconButton, RadioGroup, FormControlLabel, Radio, Typography, Tooltip, Divider,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { INGREDIENT_STATUS } from '../../utils/constants.js';

const STATUS_META = {
  Available: { color: 'success' },
  'Not Available': { color: 'error' },
  'Need More': { color: 'warning' },
};

/**
 * Ingredient builder. A dropdown selects "How many ingredients?" (1–15) which
 * generates that many rows. Each row has a name, optional quantity, and an
 * availability radio group. Changes bubble up via onChange for auto-save.
 */
export default function IngredientBuilder({ ingredients = [], onChange }) {
  const setCount = (count) => {
    const next = [...ingredients];
    if (count > next.length) {
      while (next.length < count) next.push({ name: '', quantity: '', status: 'Available' });
    } else {
      next.length = count;
    }
    onChange(next);
  };

  const updateRow = (index, patch) => {
    const next = ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing));
    onChange(next);
  };

  const removeRow = (index) => onChange(ingredients.filter((_, i) => i !== index));
  const addRow = () => onChange([...ingredients, { name: '', quantity: '', status: 'Available' }]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
        <TextField
          select
          size="small"
          label="How many ingredients?"
          value={ingredients.length}
          onChange={(e) => setCount(Number(e.target.value))}
          sx={{ width: 210 }}
        >
          <MenuItem value={0}>None</MenuItem>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </TextField>
        <Typography variant="caption" color="text.secondary">
          Mark each ingredient's availability — anything not available flows to your grocery list.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {ingredients.map((ing, index) => (
          <Box
            key={index}
            sx={{
              p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
              display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, alignItems: { md: 'center' },
            }}
          >
            <TextField
              size="small"
              label={`Ingredient ${index + 1}`}
              placeholder="e.g. Spinach"
              value={ing.name}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              sx={{ flex: 1, minWidth: 160 }}
            />
            <TextField
              size="small"
              label="Qty"
              placeholder="e.g. 2"
              value={ing.quantity || ''}
              onChange={(e) => updateRow(index, { quantity: e.target.value })}
              sx={{ width: { xs: '100%', md: 96 } }}
            />
            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />
            <RadioGroup
              row
              value={ing.status}
              onChange={(e) => updateRow(index, { status: e.target.value })}
            >
              {INGREDIENT_STATUS.map((status) => (
                <FormControlLabel
                  key={status}
                  value={status}
                  control={<Radio size="small" color={STATUS_META[status].color} />}
                  label={<Typography variant="body2">{status}</Typography>}
                />
              ))}
            </RadioGroup>
            <Tooltip title="Remove ingredient">
              <IconButton size="small" color="error" onClick={() => removeRow(index)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <FormControlLabel
          control={<IconButton size="small" onClick={addRow}><AddIcon fontSize="small" /></IconButton>}
          label={<Typography variant="body2">Add ingredient</Typography>}
        />
      </Box>
    </Box>
  );
}
