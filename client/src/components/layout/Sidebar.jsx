import { NavLink, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider,
} from '@mui/material';
import Icon from '../common/Icon.jsx';
import { NAV_ITEMS } from '../../utils/constants.js';

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
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon name={item.icon} />
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
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
          width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center',
          bgcolor: 'primary.main', color: 'primary.contrastText',
        }}
      >
        <Icon name="RestaurantMenu" />
      </Box>
      <Box>
        <Typography variant="subtitle1" lineHeight={1.1}>Meal Planner</Typography>
        <Typography variant="caption" color="text.secondary">Plan • Shop • Cook</Typography>
      </Box>
    </Toolbar>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const content = (
    <>
      <Brand />
      <Divider />
      <NavList onNavigate={onClose} />
    </>
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
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
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
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
}
