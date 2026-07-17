import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import TopNav from './TopNav.jsx';
import Sidebar, { DRAWER_WIDTH } from './Sidebar.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          px: { xs: 2, sm: 3 },
          pb: 6,
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1280, mx: 'auto', mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
