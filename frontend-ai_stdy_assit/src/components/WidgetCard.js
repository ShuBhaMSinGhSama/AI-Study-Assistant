// src/components/WidgetCard.js (Refactored with MUI)
import { Card, CardContent, Typography, Box } from '@mui/material';

function WidgetCard({ title, children, minHeight = 200 }) { // Added minHeight prop
  return (
    <Card 
        sx={{ 
            borderRadius: '12px', // Rounded corners [cite: 326]
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.08)', // Professional soft shadow [cite: 761]
            minHeight: minHeight, // For uniform sizing
            display: 'flex',
            flexDirection: 'column'
        }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            sx={{ fontWeight: 'bold', color: '#333' }}>
          {title}
        </Typography>
        <Box className="card-content">
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

export default WidgetCard;