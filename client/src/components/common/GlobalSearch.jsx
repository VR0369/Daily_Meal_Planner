import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete, TextField, InputAdornment, Box, Typography, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as api from '../../api/endpoints.js';
import { toISO, prettyDate } from '../../utils/dateUtils.js';

/**
 * Global search across meal names, ingredients, categories and dates.
 * Selecting a result opens that day in the daily planner.
 */
export default function GlobalSearch() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timer = useRef(null);

  useEffect(() => {
    if (!input || input.length < 2) {
      setOptions([]);
      return undefined;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.search(input);
        setOptions(data);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => timer.current && clearTimeout(timer.current);
  }, [input]);

  return (
    <Autocomplete
      freeSolo
      size="small"
      sx={{ width: { xs: '100%', sm: 320, md: 420 } }}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.mealName || o.matchedIngredient || '')}
      onChange={(_, value) => {
        if (value && typeof value !== 'string') {
          navigate(`/daily?date=${toISO(new Date(value.date))}`);
          setInput('');
        }
      }}
      renderOption={(props, option) => {
        const { key, ...liProps } = props;
        return (
        <Box component="li" key={key} {...liProps}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {option.mealName || option.matchedIngredient}
              </Typography>
              <Chip size="small" label={option.mealType} variant="outlined" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {prettyDate(toISO(new Date(option.date)))}
              {option.category ? ` • ${option.category}` : ''}
              {option.matchedIngredient && option.mealName ? ` • ingredient: ${option.matchedIngredient}` : ''}
            </Typography>
          </Box>
        </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search meals, ingredients, dates…"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}
