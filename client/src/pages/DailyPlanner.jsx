import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PageHeader from '../components/common/PageHeader.jsx';
import DayEditor from '../components/planner/DayEditor.jsx';
import Loader from '../components/common/Loader.jsx';
import * as api from '../api/endpoints.js';
import { useApp } from '../context/AppContext.jsx';
import { todayISO, addDaysISO, prettyDate, isTodayISO } from '../utils/dateUtils.js';

export default function DailyPlanner() {
  const { notify } = useApp();
  const [params, setParams] = useSearchParams();
  const [dateISO, setDateISO] = useState(params.get('date') || null);
  const [resolving, setResolving] = useState(!params.get('date'));
  // Bump to force DayEditor remount after copy.
  const [rev, setRev] = useState(0);

  // If no date supplied, ask the server which day to open (today, or tomorrow if
  // today is already complete — per the planner spec).
  useEffect(() => {
    let cancelled = false;
    if (dateISO) return undefined;
    (async () => {
      try {
        const { data } = await api.getActiveDay();
        const iso = data?.date ? new Date(data.date).toISOString().slice(0, 10) : todayISO();
        if (!cancelled) setDateISO(iso);
      } catch {
        if (!cancelled) setDateISO(todayISO());
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateISO]);

  const go = (iso) => {
    setDateISO(iso);
    setParams({ date: iso });
  };

  const copyToTomorrow = async () => {
    try {
      await api.copyDay(dateISO, addDaysISO(dateISO, 1), 'copy');
      notify("Copied to tomorrow's plan");
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (resolving || !dateISO) return <Loader label="Finding your active day…" />;

  return (
    <Box>
      <PageHeader
        title="Daily Planner"
        subtitle={prettyDate(dateISO)}
        action={
          <Tooltip title="Copy this day's meals to tomorrow">
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyToTomorrow}>
              Copy to tomorrow
            </Button>
          </Tooltip>
        }
      />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => go(addDaysISO(dateISO, -1))}><ChevronLeftIcon /></IconButton>
        <TextField
          type="date"
          size="small"
          value={dateISO}
          onChange={(e) => e.target.value && go(e.target.value)}
        />
        <IconButton onClick={() => go(addDaysISO(dateISO, 1))}><ChevronRightIcon /></IconButton>
        <Button
          size="small"
          startIcon={<TodayIcon />}
          onClick={() => go(todayISO())}
          disabled={isTodayISO(dateISO)}
        >
          Today
        </Button>
        {isTodayISO(dateISO) && <Typography variant="caption" color="primary.main">• Today</Typography>}
      </Stack>

      <DayEditor key={`${dateISO}-${rev}`} dateISO={dateISO} onChanged={() => setRev((r) => r)} />
    </Box>
  );
}
