import React from "react";
import { Container, Typography, Box, Alert } from "@mui/material";
import styles from "./Settings.module.css";

function Settings() {
  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box mt={4}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          Settings
        </Typography>
        <Alert severity="info">Profile and notification settings are now managed in the Profile page.</Alert>
      </Box>
    </Container>
  );
}

export default Settings; 