import { useCallback, useEffect, useState } from 'react';
import {
  Box, Grid, Card, Typography, IconButton, Stack, Button, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Chip, Divider, Menu, MenuItem, useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageHeader from '../components/common/PageHeader.jsx';
import Loader from '../components/common/Loader.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import DayEditor from '../components/planner/DayEditor.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';
import { completionBg } from '../theme/theme.js';
import {
  toISO, monthName, monthGrid, weekdayHeaders, prettyDate, isTodayISO,
} from '../utils/dateUtils.js';
import { COMPLETION_LABEL } from '../utils/constants.js';

export default function MonthlyPlanner() {
  const theme = useTheme();
  const { weekStartsOn, notify } = useApp();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // ISO date open in dialog

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const anchor = toISO(new Date(cursor.year, cursor.month, 15));
      const { data } = await api.getMonth(anchor);
      const map = {};
      data.forEach((d) => {
        map[toISO(new Date(d.date))] = d;
      });
      setByDate(map);
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    load();
  }, [load]);

  const changeMonth = (delta) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const cells = monthGrid(cursor.year, cursor.month, weekStartsOn);
  const headers = weekdayHeaders(weekStartsOn);

  return (
    <Box>
      <PageHeader
        title="Monthly Planner"
        subtitle="White = empty · Yellow = some meals · Green = full day"
        action={
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => changeMonth(-1)}><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" sx={{ minWidth: 170, textAlign: 'center' }}>
              {monthName(cursor.month)} {cursor.year}
            </Typography>
            <IconButton onClick={() => changeMonth(1)}><ChevronRightIcon /></IconButton>
          </Stack>
        }
      />

      {loading ? (
        <Loader label="Loading calendar…" />
      ) : (
        <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 } }}>
          <Grid container columns={7} spacing={1} sx={{ mb: 1 }}>
            {headers.map((h) => (
              <Grid item xs={1} key={h}>
                <Typography variant="caption" color="text.secondary" align="center" display="block" fontWeight={700}>
                  {h}
                </Typography>
              </Grid>
            ))}
          </Grid>
          <Grid container columns={7} spacing={1}>
            {cells.map((iso, i) => {
              if (!iso) return <Grid item xs={1} key={`pad-${i}`} />;
              const info = byDate[iso] || { completion: 'empty', meals: [] };
              const today = isTodayISO(iso);
              const summary = info.meals.length
                ? info.meals.map((m) => `${m.mealType}: ${m.mealName}`).join('\n')
                : COMPLETION_LABEL[info.completion];
              return (
                <Grid item xs={1} key={iso}>
                  <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{summary}</span>} arrow>
                    <Box
                      onClick={() => setSelected(iso)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: today ? 'primary.main' : 'divider',
                        outline: today ? `1px solid ${theme.palette.primary.main}` : 'none',
                        bgcolor: completionBg(info.completion, theme.palette.mode),
                        minHeight: { xs: 58, sm: 84 },
                        p: 1,
                        transition: 'transform .12s ease',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                      }}
                    >
                      <Typography variant="caption" fontWeight={today ? 700 : 500} color={today ? 'primary.main' : 'text.primary'}>
                        {Number(iso.slice(8, 10))}
                      </Typography>
                      <Box sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
                        {info.meals.slice(0, 3).map((m) => (
                          <Typography key={m.mealType} variant="caption" display="block" noWrap sx={{ fontSize: 10, opacity: 0.8 }}>
                            {m.mealName}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      <DayDetailDialog
        dateISO={selected}
        onClose={() => setSelected(null)}
        onMutated={load}
        notify={notify}
      />
    </Box>
  );
}

function DayDetailDialog({ dateISO, onClose, onMutated, notify }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [copyTarget, setCopyTarget] = useState('');
  const [copyMode, setCopyMode] = useState('copy');
  const [copyOpen, setCopyOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [planId, setPlanId] = useState(null);

  useEffect(() => {
    setCopyTarget(dateISO || '');
  }, [dateISO]);

  const open = Boolean(dateISO);

  const doCopy = async () => {
    try {
      await api.copyDay(dateISO, copyTarget, copyMode);
      notify(copyMode === 'move' ? 'Meals moved' : 'Meals copied');
      setCopyOpen(false);
      onMutated();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const doDelete = async () => {
    try {
      const { data } = await api.getPlanByDate(dateISO);
      if (data?._id) await api.deletePlan(data._id);
      notify('Day cleared');
      setConfirmDelete(false);
      onClose();
      onMutated();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {dateISO && prettyDate(dateISO)}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreVertIcon /></IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { setCopyMode('copy'); setCopyOpen(true); setMenuAnchor(null); }}>Copy / duplicate to…</MenuItem>
            <MenuItem onClick={() => { setCopyMode('move'); setCopyOpen(true); setMenuAnchor(null); }}>Move to…</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setConfirmDelete(true); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>Delete day</MenuItem>
          </Menu>
        </DialogTitle>
        <DialogContent dividers>
          {dateISO && <DayEditor dateISO={dateISO} onChanged={onMutated} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{copyMode === 'move' ? 'Move meals to' : 'Copy meals to'}</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            sx={{ mt: 1 }}
            value={copyTarget}
            onChange={(e) => setCopyTarget(e.target.value)}
          />
          <Chip size="small" sx={{ mt: 2 }} label={copyMode === 'move' ? 'Original day will be cleared' : 'Original day is kept'} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCopyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={doCopy} disabled={!copyTarget || copyTarget === dateISO}>
            {copyMode === 'move' ? 'Move' : 'Copy'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this day's plan?"
        message="This removes all meals planned for this day. This cannot be undone."
        confirmLabel="Delete"
        color="error"
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
