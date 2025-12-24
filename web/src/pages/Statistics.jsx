import React from 'react';
import { Typography, Box } from '@mui/material';

function Statistics() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>
      <Typography color="text.secondary">
        This page will show your financial statistics.
      </Typography>
    </Box>
  );
}

export default Statistics;
