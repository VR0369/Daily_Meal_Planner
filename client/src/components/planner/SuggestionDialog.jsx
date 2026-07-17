import { useCallback, useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Card, CardContent,
  Stack, Chip, IconButton, Tooltip, TextField, CircularProgress,
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import * as api from '../../api/endpoints.js';
import { CORE_MEAL_TYPES } from '../../utils/constants.js';

/**
 * AI meal suggestions for a category. The user can Regenerate all, Replace a
 * single meal name inline, or Accept the set (applied to the plan upstream).
 */
export default function SuggestionDialog({ open, onClose, category, mealTypes = CORE_MEAL_TYPES, onAccept }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (seed) => {
      if (!category) return;
      setLoading(true);
      try {
        const { data } = await api.getSuggestions(category, mealTypes, seed);
        setSuggestions(data);
      } finally {
        setLoading(false);
      }
    },
    [category, mealTypes]
  );

  useEffect(() => {
    if (open) load(Math.floor(Math.random() * 1e9));
  }, [open, load]);

  const regenerateOne = async (index) => {
    const { data } = await api.getSuggestions(category, [suggestions[index].mealType], Math.floor(Math.random() * 1e9));
    setSuggestions((prev) => prev.map((s, i) => (i === index ? data[0] : s)));
  };

  const editName = (index, mealName) =>
    setSuggestions((prev) => prev.map((s, i) => (i === index ? { ...s, mealName } : s)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="secondary" />
        AI suggestions
        {category && <Chip size="small" label={category} sx={{ ml: 1 }} />}
      </DialogTitle>
      <DialogContent>
        {loading && suggestions.length === 0 ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {suggestions.map((s, index) => (
              <Card key={s.mealType} variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Chip size="small" label={s.mealType} color="primary" variant="outlined" />
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Regenerate this meal">
                      <IconButton size="small" onClick={() => regenerateOne(index)}>
                        <AutorenewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    value={s.mealName}
                    onChange={(e) => editName(index, e.target.value)}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {s.ingredients.map((i) => i.name).join(' • ')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button startIcon={<AutorenewIcon />} onClick={() => load(Math.floor(Math.random() * 1e9))} disabled={loading}>
          Regenerate all
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={loading || suggestions.length === 0}
          onClick={() => {
            onAccept(suggestions);
            onClose();
          }}
        >
          Accept &amp; add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
