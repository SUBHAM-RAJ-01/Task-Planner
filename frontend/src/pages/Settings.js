import React from "react";
import { Container, Typography, Box, Alert, Switch, FormControlLabel, Paper, Divider, Link } from "@mui/material";
import styles from "./Settings.module.css";
import { useContext } from 'react';
import { ColorModeContext } from '../App';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';

function Settings() {
  const colorMode = useContext(ColorModeContext);
  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          Settings
        </Typography>
        <Alert severity="info">Profile and notification settings are now managed in the Profile page.</Alert>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Brightness4Icon />
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={colorMode.mode === 'dark'}
                onChange={colorMode.toggleColorMode}
                color="primary"
              />
            }
            label={colorMode.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
          />
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SupportAgentIcon />
            Support
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Need help or have feedback? Reach out to our support team!
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">
            Email: <Link href="mailto:subhamraj.work@yahoo.com" underline="hover">subhamraj.work@yahoo.com</Link>
          </Typography>
        </Paper>
        {/* Contribute Section */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GitHubIcon />
            Contribute
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Want to contribute to SmartPlan? Check out our GitHub repository and submit a pull request!
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2">
            GitHub: <Link href="https://github.com/SUBHAM-RAJ-01/Task-Planner" target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <GitHubIcon fontSize="small" /> github.com/SUBHAM-RAJ-01/Task-Planner
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Settings; 