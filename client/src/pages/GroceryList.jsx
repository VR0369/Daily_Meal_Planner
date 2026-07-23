import { useCallback, useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Stack, IconButton, Divider, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, Collapse, LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '../components/common/PageHeader.jsx';
import { GRADIENTS } from '../theme/theme.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';
import { prettyDate, apiISO } from '../utils/dateUtils.js';
import { STATUS_COLOR } from '../utils/constants.js';

export default function GroceryList() {
  const { notify } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replaceFor, setReplaceFor] = useState(null);
  const [replacement, setReplacement] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getGrocery();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await api.refreshGrocery();
    await load();
    notify('Grocery list refreshed');
  };

  const purchase = async (item) => {
    const { data } = await api.markPurchased(item._id);
    setItems(data);
    notify(`${item.name} marked as available everywhere`);
  };

  const cannotFind = async () => {
    await api.markCannotFind(replaceFor._id, replacement);
    setReplaceFor(null);
    setReplacement('');
    await load();
    notify('Kept on list' + (replacement ? ' with a replacement' : ''));
  };

  if (loading) return <Loader label="Building your grocery list…" />;

  const toBuy = items.filter((i) => !i.purchased);
  const done = items.filter((i) => i.purchased);
  const progress = items.length ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <Box>
      <PageHeader
        title="Grocery List"
        gradient={GRADIENTS.berry}
        subtitle="Auto-generated from every ingredient marked Not Available or Need More"
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>Refresh</Button>}
      />

      {items.length === 0 ? (
        <EmptyState
          icon="ShoppingCart"
          title="Nothing to buy"
          description="When you mark ingredients as “Not Available” or “Need More” in your meal plans, they'll appear here automatically."
        />
      ) : (
        <>
          <Card
            variant="outlined"
            sx={{
              mb: 2,
              backgroundImage: 'linear-gradient(120deg, rgba(255,46,147,.14), rgba(124,77,255,.08))',
              borderColor: 'secondary.light',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" fontWeight={700}>
                  🛒 {done.length} of {items.length} purchased
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={progress === 100 ? 'success' : 'secondary'}
                    sx={{ height: 12, bgcolor: 'rgba(124,77,255,.14)' }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={800}
                  sx={{
                    background: GRADIENTS.berry,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {progress}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>🧺 To buy ({toBuy.length})</Typography>
          <Grid container spacing={2}>
            {toBuy.map((item) => (
              <Grid item xs={12} md={6} key={item._id}>
                <GroceryCard
                  item={item}
                  onPurchase={() => purchase(item)}
                  onCannotFind={() => { setReplaceFor(item); setReplacement(item.replacement || ''); }}
                />
              </Grid>
            ))}
          </Grid>

          {done.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>✅ Purchased ({done.length})</Typography>
              <Grid container spacing={2}>
                {done.map((item) => (
                  <Grid item xs={12} md={6} key={item._id}>
                    <GroceryCard item={item} purchased />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      <Dialog open={Boolean(replaceFor)} onClose={() => setReplaceFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Can't find {replaceFor?.name}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            It stays on your list. Optionally add a replacement ingredient to look for instead.
          </Typography>
          <TextField
            fullWidth
            label="Replacement (optional)"
            placeholder="e.g. Almond milk instead of Oat milk"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReplaceFor(null)}>Cancel</Button>
          <Button variant="contained" onClick={cannotFind}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function GroceryCard({ item, onPurchase, onCannotFind, purchased }) {
  const [showSources, setShowSources] = useState(false);
  return (
    <Card
      variant="outlined"
      sx={{
        opacity: purchased ? 0.72 : 1,
        borderLeft: '5px solid',
        borderLeftColor: purchased ? 'success.main' : 'secondary.main',
        backgroundImage: purchased
          ? 'linear-gradient(120deg, rgba(0,196,140,.12), transparent 60%)'
          : 'linear-gradient(120deg, rgba(255,46,147,.10), transparent 60%)',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ textDecoration: purchased ? 'line-through' : 'none' }}>
              {item.name}
              {item.quantity ? ` · ${item.quantity}` : ''}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip size="small" color={STATUS_COLOR[item.status] || 'default'} label={item.status} />
              <Chip
                size="small"
                variant="outlined"
                clickable
                onClick={() => setShowSources((v) => !v)}
                icon={<ExpandMoreIcon fontSize="small" />}
                label={`Needed for ${item.sources.length} meal${item.sources.length > 1 ? 's' : ''}`}
              />
              {item.replacement && <Chip size="small" color="info" label={`↔ ${item.replacement}`} />}
            </Stack>
          </Box>
          {!purchased && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Mark purchased — updates all meals to Available">
                <IconButton color="success" onClick={onPurchase}><CheckCircleIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Can't find — keep on list / add replacement">
                <IconButton color="warning" onClick={onCannotFind}><BlockIcon /></IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        <Collapse in={showSources}>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.5}>
            {item.sources.map((s, i) => (
              <Typography key={i} variant="caption" color="text.secondary">
                {s.meal}{s.mealName ? ` (${s.mealName})` : ''} · {prettyDate(apiISO(s.day), { withYear: false })}
                {s.quantity ? ` · qty ${s.quantity}` : ''} · {s.status}
              </Typography>
            ))}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}
