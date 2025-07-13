import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaCog, 
  FaBell,
  FaChartLine,
  FaTrophy,
  FaClock,
  FaTasks,
  FaEdit,
  FaSave,
  FaRocket
} from "react-icons/fa";
import { MdDashboard, MdSecurity, MdNotifications } from "react-icons/md";
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import styles from "./Profile.module.css";
import { useAuth } from "../firebase/useAuth";

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    bio: 'Productivity enthusiast and goal achiever.',
    timezone: 'UTC-5',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    productivity: 0,
    streak: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || "User");
  const [bio, setBio] = useState('Productivity enthusiast and goal achiever.');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false
  });

  // Load profile data from localStorage on component mount
  useEffect(() => {
    if (!user?.uid) return;

    // Load saved profile data
    const savedProfile = loadFromStorage(storageKeys.PROFILE, user.uid, null, 'profile');
    if (savedProfile) {
      setProfile(savedProfile);
      setDisplayName(savedProfile.displayName || user?.displayName || user?.email?.split('@')[0] || "User");
      setBio(savedProfile.bio || 'Productivity enthusiast and goal achiever.');
    }

    // Load saved notification settings
    const savedNotificationSettings = loadFromStorage(storageKeys.PROFILE_NOTIFICATIONS, user.uid);
    if (savedNotificationSettings) {
      setNotificationSettings(savedNotificationSettings);
    }

    // Load saved stats
    const savedStats = loadFromStorage(storageKeys.PROFILE_STATS, user.uid, null, 'stats');
    if (savedStats) {
      setStats(savedStats);
    } else {
      // Load default stats if no saved data
      setStats({
        totalTasks: 45,
        completedTasks: 38,
        productivity: 84,
        streak: 7
      });
    }
  }, [user?.uid]);

  // Save profile data to localStorage whenever profile changes
  useEffect(() => {
    if (user?.uid) {
      const profileData = {
        ...profile,
        displayName: displayName,
        bio: bio
      };
      saveToStorage(storageKeys.PROFILE, profileData, user.uid);
    }
  }, [profile, displayName, bio, user?.uid]);

  // Save notification settings to localStorage whenever settings change
  useEffect(() => {
    if (user?.uid) {
      saveToStorage(storageKeys.PROFILE_NOTIFICATIONS, notificationSettings, user.uid);
    }
  }, [notificationSettings, user?.uid]);

  // Save stats to localStorage whenever stats change
  useEffect(() => {
    if (user?.uid) {
      saveToStorage(storageKeys.PROFILE_STATS, stats, user.uid);
    }
  }, [stats, user?.uid]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(prev => ({
        ...prev,
        displayName: displayName,
        bio: bio
      }));
      
      setIsEditing(false);
      toast.success("Profile updated successfully! 🎉");
    } catch (err) {
      setError("Failed to update profile");
      toast.error("Failed to update profile");
    }
    setLoading(false);
  };

  const handleToggleSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success(`${setting} notifications ${!notificationSettings[setting] ? 'enabled' : 'disabled'}`);
  };

  const getDaysSinceCreation = () => {
    if (!profile?.createdAt) return 0;
    const now = new Date();
    const created = new Date(profile.createdAt);
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!profile) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: "center", color: "white" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTop: "3px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }} />
            <Typography variant="h6">Loading profile...</Typography>
          </Box>
        </motion.div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        pt: 2,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Box textAlign="center" mb={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{ display: "inline-block", marginBottom: "16px" }}
              >
                <FaUser style={{ fontSize: "3rem", color: "#fff" }} />
              </motion.div>
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: "#fff",
                  mb: 1
                }}
              >
                Profile
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Manage your account and preferences
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <motion.div variants={itemVariants}>
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        <FaUser style={{ color: "#667eea" }} />
                        Personal Information
                      </Typography>
                      <IconButton
                        onClick={() => setIsEditing(!isEditing)}
                        sx={{ color: "#667eea" }}
                      >
                        <FaEdit />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", mb: 3 }}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{ display: "inline-block" }}
                          >
                            <Avatar
                              src={profile.photoURL}
                              sx={{
                                width: 120,
                                height: 120,
                                margin: "0 auto",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                fontSize: "3rem",
                                fontWeight: 600,
                              }}
                            >
                                                          {displayName?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                        </motion.div>
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                          {displayName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Member for {getDaysSinceCreation()} days
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={8}>
                        <TextField
                          label="Display Name"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          fullWidth
                          margin="normal"
                          disabled={!isEditing}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Bio"
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          margin="normal"
                          disabled={!isEditing}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Email"
                          value={profile.email}
                          fullWidth
                          margin="normal"
                          disabled
                          sx={{ mb: 2 }}
                        />
                        
                        {isEditing && (
                          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleSave}
                              disabled={loading}
                              startIcon={<FaSave />}
                              sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              }}
                            >
                              {loading ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <MdNotifications style={{ color: "#667eea" }} />
                      Notification Settings
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box sx={{ color: "#667eea" }}>
                                {key === 'email' && <FaEnvelope />}
                                {key === 'push' && <FaBell />}
                                {key === 'browser' && <MdNotifications />}
                                {key === 'sound' && <FaCog />}
                                {key === 'reminders' && <FaClock />}
                              </Box>
                              <Typography variant="body2" sx={{ textTransform: "capitalize", fontWeight: 500 }}>
                                {key} Notifications
                              </Typography>
                            </Box>
                            <Switch
                              checked={value}
                              onChange={() => handleToggleSetting(key)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#667eea',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#667eea',
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVariants}>
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaRocket style={{ color: "#667eea" }} />
                      Account Stats
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaCalendarAlt style={{ color: "#667eea" }} />
                          <Typography variant="body2">Member Since</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {profile.createdAt?.toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaClock style={{ color: "#667eea" }} />
                          <Typography variant="body2">Last Sign In</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {profile.lastSignIn?.toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaTasks style={{ color: "#667eea" }} />
                          <Typography variant="body2">Days Active</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {getDaysSinceCreation()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <MdSecurity style={{ color: "#667eea" }} />
                      Security
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaEnvelope />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Change Email
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaCog />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaBell />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Two-Factor Auth
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaTrophy style={{ color: "#667eea" }} />
                      Achievements
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Chip label="First Task" color="success" size="small" />
                        <Typography variant="body2">Completed your first task</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Chip label="7 Day Streak" color="primary" size="small" />
                        <Typography variant="body2">Used SmartPlan for 7 days</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Chip label="Task Master" color="warning" size="small" />
                        <Typography variant="body2">Completed 50 tasks</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Profile; 