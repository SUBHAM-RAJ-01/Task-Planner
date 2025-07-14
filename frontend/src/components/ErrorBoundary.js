import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { FaRocket } from 'react-icons/fa';
import Button from '@mui/material/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            p: 4
          }}
        >
          <FaRocket style={{ fontSize: '5rem', marginBottom: 24, color: '#fff' }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Oops! Something unexpected happened
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.85)' }}>
            An unexpected error occurred. Please try refreshing the page.<br/>
            If the problem persists, contact support.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              mb: 2
            }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box mt={4} p={2} bgcolor="rgba(0,0,0,0.3)" borderRadius={2}>
              <Typography variant="body2" color="#fff">
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 