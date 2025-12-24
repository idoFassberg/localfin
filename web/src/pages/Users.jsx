import React from 'react';
import { Typography, Box } from '@mui/material';

function Users() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Typography color="text.secondary">
        This page will show user management features.
      </Typography>
    </Box>
  );
}

export default Users;
