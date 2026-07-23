import { NavLink, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Icon from '../common/Icon.jsx';
import { NAV_ITEMS } from '../../utils/constants.js';
import { GRADIENTS } from '../../theme/theme.js';

export const DRAWER_WIDTH = 248;

function NavList({ onNavigate }) {
  const { pathname } = useLocation();
  return (
    <List sx={{ px: 1.5, py: 1 }}>
      {NAV_ITEMS.map((item) => {
        const selected = pathname === item.path;
        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            selected={selected}
            sx={{
              borderRadius: 999,
              mb: 0.75,
              transition: 'transform .18s ease, background-color .18s ease',
              // Each item glows in its own hue; the active one fills with it.
              '& .MuiListItemIcon-root': { color: item.color },
              '&:hover': { bgcolor: alpha(item.color, 0.12), transform: 'translateX(4px)' },
              '&.Mui-selected': {
                color: '#fff',
                background: `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.75)} 100%)`,
                boxShadow: `0 8px 18px -10px ${item.color}`,
                '& .MuiListItemIcon-root': { color: '#fff' },
                '&:hover': {
                  background: `linear-gradient(135deg, ${item.color} 0%, ${alpha(item.color, 0.75)} 100%)`,
                  filter: 'brightness(1.06)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon name={item.icon} />
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
          </ListItemButton>
        );
      })}
    </List>
  );
}

function Brand() {
  return (
    <Toolbar sx={{ gap: 1.2 }}>
      <Box
        sx={{
          width: 42, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center',
          background: GRADIENTS.brand, color: '#fff',
          boxShadow: '0 10px 22px -10px rgba(124,77,255,.95)',
        }}
      >
        <Icon name="RestaurantMenu" />
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          lineHeight={1.1}
          sx={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 19,
            background: GRADIENTS.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          Meal Planner
        </Typography>
        <Typography variant="caption" color="text.secondary">Plan • Shop • Cook</Typography>
      </Box>
    </Toolbar>
  );
}

/** Bottom-of-rail flourish — keeps the sidebar from ending on empty space. */
function VibeCard() {
  return (
    <Box sx={{ mt: 'auto', p: 2 }}>
      <Box
        sx={{
          p: 2, borderRadius: '22px', color: '#fff', background: GRADIENTS.candy,
          boxShadow: '0 14px 30px -16px rgba(255,46,147,.9)',
        }}
      >
        <Chip
          size="small"
          label="✨ Pro tip"
          sx={{ bgcolor: 'rgba(255,255,255,.25)', color: '#fff', mb: 1 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
          Plan a whole week in one go — your grocery list builds itself.
        </Typography>
      </Box>
    </Box>
  );
}

// A whisper of violet behind the rail so it separates from the canvas.
const paperTint = {
  backgroundImage: (t) =>
    t.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(124,77,255,.16) 0%, rgba(255,46,147,.06) 100%)'
      : 'linear-gradient(180deg, rgba(124,77,255,.07) 0%, rgba(255,46,147,.04) 100%)',
};

export default function Sidebar({ mobileOpen, onClose }) {
  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Brand />
      <Divider />
      <NavList onNavigate={onClose} />
      <VibeCard />
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', ...paperTint },
        }}
      >
        {content}
      </Drawer>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider',
            ...paperTint,
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
}
