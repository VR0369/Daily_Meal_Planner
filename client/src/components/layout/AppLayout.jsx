import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import TopNav from './TopNav.jsx';
import Sidebar, { DRAWER_WIDTH } from './Sidebar.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        // Soft colour mesh behind everything — keeps the canvas from going flat.
        backgroundImage: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(60rem 30rem at 12% -8%, rgba(124,77,255,.30), transparent 60%),'
              + 'radial-gradient(45rem 26rem at 95% 6%, rgba(255,46,147,.22), transparent 60%),'
              + 'radial-gradient(45rem 30rem at 60% 105%, rgba(0,194,255,.16), transparent 60%)'
            : 'radial-gradient(60rem 30rem at 12% -8%, rgba(124,77,255,.16), transparent 60%),'
              + 'radial-gradient(45rem 26rem at 95% 6%, rgba(255,46,147,.12), transparent 60%),'
              + 'radial-gradient(45rem 30rem at 60% 105%, rgba(0,194,255,.10), transparent 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
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
