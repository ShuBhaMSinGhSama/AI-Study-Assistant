// src/components/dashbrdlayout.js (CORRECTED IMPORTS)

import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import WidgetCard from './WidgetCard';
// Add Typography and LinearProgress to this line
import { Box, Grid, Button, TextField, LinearProgress, Typography } from '@mui/material'; 

function DashboardLayout() {
  return (
    // Main container using MUI Box
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <SidebarNav />

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <HeaderBar />

        {/* Content Padding */}
        <Box sx={{ p: 4, pt: 3 }}> 
          
          {/* The Widget Grid: using MUI Grid for professional responsiveness */}
          <Grid container spacing={3}>
            
            {/* 1. Doubt Solver Widget (Main Feature - takes up more space) */}
            <Grid item xs={12} md={7}>
              <WidgetCard title="🧠 Ask a Doubt" minHeight={300}>
                <Box sx={{ mt: 2 }}>
                    <TextField 
                        fullWidth 
                        multiline
                        rows={4} 
                        placeholder="Type your academic question here (e.g., Explain the process of Photosynthesis in simple terms)..."
                        variant="outlined"
                        sx={{ mb: 1, bgcolor: '#fbfbfb', borderRadius: '8px' }}
                    />
                    <Button variant="contained" color="primary" sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#43a047' }}}>
                        Get AI Answer
                    </Button>
                </Box>
              </WidgetCard>
            </Grid>

            {/* 2. Progress Tracker (Slightly smaller, fits next to Doubt Solver) */}
            <Grid item xs={12} md={5}>
              <WidgetCard title="📈 Progress Tracker" minHeight={300}>
                 <Typography variant="body1" sx={{ mb: 2 }}>
                    You have covered **75%** of your target topics this week.
                 </Typography>
                 <LinearProgress variant="determinate" value={75} sx={{ height: 10, borderRadius: 5, mb: 3 }} />
                 <Button variant="outlined" size="small">View Detailed Report</Button>
              </WidgetCard>
            </Grid>
            
            {/* 3. Notes Summarizer Widget (Standard size) */}
            <Grid item xs={12} sm={6} lg={4}>
              <WidgetCard title="📑 Notes Summarizer">
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Upload notes or PDFs to get a concise, AI-powered summary.
                </Typography>
                <Button variant="contained" color="secondary">
                    Upload File
                </Button>
              </WidgetCard>
            </Grid>
            
            {/* 4. Smart Quiz Generator Widget (Standard size) */}
            <Grid item xs={12} sm={6} lg={4}>
              <WidgetCard title="📝 Smart Quiz">
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Generate a practice quiz or flashcards from your uploaded material.
                </Typography>
                <Button variant="contained" color="info">
                    Start Quiz
                </Button>
              </WidgetCard>
            </Grid>
            
            {/* 5. Quick Revision Widget (Standard size) */}
            <Grid item xs={12} sm={6} lg={4}>
              <WidgetCard title="💡 Quick Revision">
                <Typography variant="body2" sx={{ mb: 2 }}>
                    **Newton's Second Law:** $F = ma$
                    <br/>
                    **Mitosis Stages:** Prophase, Metaphase, Anaphase, Telophase.
                </Typography>
                <Button variant="text" size="small">More Definitions</Button>
              </WidgetCard>
            </Grid>
            
          </Grid>
          
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;