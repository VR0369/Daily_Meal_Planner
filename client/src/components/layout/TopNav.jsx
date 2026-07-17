import {
  AppBar, Toolbar, IconButton, Box, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { useState } from 'react';
import { useColorMode } from '../../context/ColorModeContext.jsx';
import GlobalSearch from '../common/GlobalSearch.jsx';

export default function TopNav({ onMenuClick }) {
  const { mode, preference, setPreference } = useColorMode();
  const [anchor, setAnchor] = useState(null);

  const options = [
    { value: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
    { value: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
    { value: 'system', label: 'System', icon: <SettingsBrightnessIcon fontSize="small" /> },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(22,29,33,0.85)' : 'rgba(255,255,255,0.85)'),
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, maxWidth: 460 }}>
          <GlobalSearch />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Theme">
          <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
            {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {options.map((o) => (
            <MenuItem
              key={o.value}
              selected={preference === o.value}
              onClick={() => {
                setPreference(o.value);
                setAnchor(null);
              }}
            >
              <ListItemIcon>{o.icon}</ListItemIcon>
              <ListItemText>{o.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
