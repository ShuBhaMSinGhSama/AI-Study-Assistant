// src/components/SidebarNav.js (Refactored with MUI)
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Doubt Solver
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'; // Notes
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'; // Quizzes
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'; // Planner
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'; // Profile
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Theme

const navItems = [
    { text: 'Dashboard', icon: HomeIcon, link: '/' },
    { text: 'Doubt Solver', icon: HelpOutlineIcon, link: '/doubt' },
    { text: 'Notes Summarizer', icon: DescriptionOutlinedIcon, link: '/notes' },
    { text: 'Quiz Generator', icon: QuizOutlinedIcon, link: '/quiz' },
    { text: 'Study Planner', icon: CalendarMonthOutlinedIcon, link: '/planner' },
    { text: 'Profile', icon: AccountCircleOutlinedIcon, link: '/profile' },
];

function SidebarNav() {
  return (
    <Box 
        sx={{ 
            width: 250, 
            bgcolor: '#2d3436', // Dark background [cite: 759]
            color: 'white', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 3 // Soft shadow
        }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>StudyAI</Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
                sx={{ 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    py: 1.5 // Vertical padding
                }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">Theme Toggle</Typography>
        <Brightness4Icon sx={{ cursor: 'pointer' }} />
      </Box>
    </Box>
  );
}

export default SidebarNav;