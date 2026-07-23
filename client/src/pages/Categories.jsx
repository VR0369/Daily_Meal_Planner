import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../components/common/PageHeader.jsx';
import { GRADIENTS } from '../theme/theme.js';
import Icon from '../components/common/Icon.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';

const ICON_CHOICES = ['Restaurant', 'Spa', 'Grass', 'EggAlt', 'SetMeal', 'Egg', 'Forest', 'RiceBowl', 'LocalPizza', 'RamenDining', 'LunchDining', 'FitnessCenter', 'Grain', 'Icecream', 'Tune'];
const COLOR_CHOICES = [
  '#7C4DFF', '#FF2E93', '#FF9F1A', '#00C48C', '#00C2FF', '#FF4D6D',
  '#B14BFF', '#FF6A3D', '#22D3A6', '#4C6FFF', '#F4C20D',
];

export default function Categories() {
  const { categories, loadCategories, notify } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', color: COLOR_CHOICES[0], icon: 'Restaurant', description: '' });
  const [toDelete, setToDelete] = useState(null);

  const create = async () => {
    try {
      await api.createCategory(form);
      await loadCategories();
      setOpen(false);
      setForm({ name: '', color: COLOR_CHOICES[0], icon: 'Restaurant', description: '' });
      notify('Category added');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const remove = async () => {
    try {
      await api.deleteCategory(toDelete._id);
      await loadCategories();
      setToDelete(null);
      notify('Category removed');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Meal Categories"
        gradient={GRADIENTS.candy}
        subtitle="Categories power AI suggestions. Add your own — they're saved to the database."
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add category</Button>}
      />

      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.name}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                // Every category wears its own colour, so the grid reads as a palette.
                borderColor: `${cat.color}55`,
                backgroundImage: `linear-gradient(155deg, ${cat.color}1F 0%, transparent 60%)`,
                '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 22px 40px -24px ${cat.color}` },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 48, height: 48, borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#fff',
                      background: `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}99 100%)`,
                      boxShadow: `0 10px 20px -10px ${cat.color}`,
                    }}
                  >
                    <Icon name={cat.icon} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{cat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.isCustom ? 'Custom' : 'Built-in'}
                    </Typography>
                  </Box>
                  {cat.isCustom && cat._id && (
                    <Tooltip title="Delete custom category">
                      <IconButton size="small" color="error" onClick={() => setToDelete(cat)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                {cat.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{cat.description}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add meal category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            <TextField select label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
              {ICON_CHOICES.map((ic) => (
                <MenuItem key={ic} value={ic}>
                  <Stack direction="row" spacing={1} alignItems="center"><Icon name={ic} fontSize="small" /><span>{ic}</span></Stack>
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="caption" color="text.secondary">Colour</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                {COLOR_CHOICES.map((c) => (
                  <Box
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    sx={{
                      width: 28, height: 28, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                      outline: form.color === c ? '3px solid' : 'none', outlineColor: 'primary.main',
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <TextField label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!form.name.trim()} onClick={create}>Add</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category?"
        message={`Remove "${toDelete?.name}"? Existing meal plans keep their data.`}
        confirmLabel="Delete"
        color="error"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
