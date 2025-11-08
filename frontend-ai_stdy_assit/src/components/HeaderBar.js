// src/components/HeaderBar.js (Refactored with MUI)
import { Box, Typography, IconButton, Tooltip, AppBar, Toolbar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircle from '@mui/icons-material/AccountCircle';

function HeaderBar() {
  return (
    // AppBar is a specialized MUI component for headers
    <AppBar position="static" 
        sx={{ 
            bgcolor: 'white', 
            color: '#2d3436', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)' // Soft shadow [cite: 760]
        }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
          Hi, Alex! 👋
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" size="large">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton color="inherit" size="large">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profile">
             <IconButton color="inherit" size="large">
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default HeaderBar;