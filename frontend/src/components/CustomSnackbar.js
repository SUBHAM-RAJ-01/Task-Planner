import React from 'react';
import { Snackbar, Alert } from '@mui/material';

function CustomSnackbar({ open, message, severity = 'success', onClose, autoHideDuration = 2000 }) {
  // Add error boundary for the Snackbar component
  if (!open || !message) {
    return null;
  }

  // Wrap in try-catch to handle any Material-UI transition errors
  try {
    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={undefined} // Use default transition
        sx={{
          '& .MuiSnackbar-root': {
            zIndex: 1400,
          },
        }}
      >
        <Alert 
          severity={severity} 
          onClose={onClose}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  } catch (error) {
    console.error('Snackbar error:', error);
    // Fallback to a simple alert if Snackbar fails
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1400,
        padding: '12px 24px',
        backgroundColor: severity === 'error' ? '#f44336' : '#4caf50',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
      }}>
        {message}
      </div>
    );
  }
}

export default CustomSnackbar; 