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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  FaRocket,
  FaFire,
  FaStar,
  FaMedal,
  FaCheckCircle
} from "react-icons/fa";
import { MdDashboard, MdSecurity, MdNotifications } from "react-icons/md";
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import styles from "./Profile.module.css";
import { useAuth } from "../firebase/useAuth";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

function Profile() {
  const { user, updateEmail } = useAuth();
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

  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [editingField, setEditingField] = useState(null); // 'displayName' | 'bio' | null
  const displayNameRef = React.useRef();
  const bioRef = React.useRef();
  const [profileLoaded, setProfileLoaded] = useState(false);

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
    setProfileLoaded(true);

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

  // On mount, fetch profile from backend for cross-device sync
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setDisplayName(data.user.displayName || user.displayName || user.email?.split('@')[0] || 'User');
        setBio(data.user.bio || 'Productivity enthusiast and goal achiever.');
      }
      setProfileLoaded(true);
    };
    fetchProfile();
  }, [user?.uid]);

  // Save profile data to localStorage whenever profile changes, but only after initial load
  useEffect(() => {
    if (user?.uid && profileLoaded) {
      const profileData = {
        ...profile,
        displayName: displayName,
        bio: bio,
        photoURL: profile.photoURL || '',
      };
      saveToStorage(storageKeys.PROFILE, profileData, user.uid);
    }
  }, [profile, displayName, bio, user?.uid, profileLoaded]);

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

  // Helper to get streak from stats or tasks
  const getStreakTier = (streak) => {
    if (streak >= 30) return { label: 'Platinum Streak', color: 'secondary', icon: <FaMedal style={{ color: '#b3e5fc' }} /> };
    if (streak >= 14) return { label: 'Gold Streak', color: 'warning', icon: <FaStar style={{ color: '#ffd700' }} /> };
    if (streak >= 7) return { label: 'Silver Streak', color: 'primary', icon: <FaStar style={{ color: '#90caf9' }} /> };
    if (streak >= 3) return { label: 'Bronze Streak', color: 'success', icon: <FaFire style={{ color: '#ed8936' }} /> };
    return null;
  };
  const streakTier = getStreakTier(stats.streak);

  // Compute earned badges
  const daysSinceCreation = getDaysSinceCreation();
  const earnedBadges = [];
  if (stats.completedTasks > 0) {
    earnedBadges.push({ label: 'First Task', color: 'success', icon: <FaCheckCircle />, desc: 'Completed your first task' });
  }
  if (stats.streak >= 7) {
    earnedBadges.push({ label: '7 Day Streak', color: 'primary', icon: <FaFire />, desc: 'Used SmartPlan for 7 days' });
  }
  if (stats.completedTasks >= 50) {
    earnedBadges.push({ label: 'Task Master', color: 'warning', icon: <FaStar />, desc: 'Completed 50 tasks' });
  }
  if (streakTier) {
    earnedBadges.push({ label: streakTier.label, color: streakTier.color, icon: streakTier.icon, desc: `Current streak: ${stats.streak} days` });
  }
  if (daysSinceCreation <= 2 || stats.completedTasks === 0) {
    earnedBadges.push({ label: 'Starter', color: 'default', icon: <FaRocket />, desc: 'Welcome to SmartPlan! Start your productivity journey.' });
  }

  // Account stats: use user metadata if available
  const memberSince = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : (profile.createdAt ? new Date(profile.createdAt) : null);
  const lastSignIn = user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : (profile.lastSignIn ? new Date(profile.lastSignIn) : null);

  // Change Email handler
  const handleChangeEmail = async () => {
    setEmailLoading(true);
    setEmailError("");
    try {
      await updateEmail(newEmail);
      setProfile(prev => ({ ...prev, email: newEmail }));
      setChangeEmailOpen(false);
      setNewEmail("");
    } catch (err) {
      setEmailError(err.message || "Failed to update email");
    }
    setEmailLoading(false);
  };

  // Replace handleAvatarChange with Firebase Storage upload and backend sync
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && user?.uid) {
      const storage = getStorage(getApp());
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore via backend
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ photoURL: downloadURL })
      });

      // Update local state/UI
      setProfile(prev => ({ ...prev, photoURL: downloadURL }));
    }
  };

  // Inline save handler
  const handleInlineSave = (field, value) => {
    if (field === 'displayName') setDisplayName(value);
    if (field === 'bio') setBio(value);
    setProfile(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
    // Save to localStorage
    if (user?.uid) {
      const savedProfile = loadFromStorage(storageKeys.PROFILE, user.uid, null, 'profile') || {};
      saveToStorage(storageKeys.PROFILE, { ...savedProfile, [field]: value }, user.uid);
    }
  };

  // Handle Enter/blur
  const handleInlineKey = (e, field) => {
    if (e.key === 'Enter') {
      handleInlineSave(field, e.target.value);
    }
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

  const PROFILE_BANNER_URL = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"; // Example Unsplash image

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
                <FaUser style={{ fontSize: "3rem", color: "#667eea" }} />
              </motion.div>
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: "#1a202c",
                  mb: 1
                }}
              >
                Profile
              </Typography>
              <Typography variant="h6" sx={{ color: "#4a5568" }}>
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
                            style={{ display: "inline-block", marginBottom: "16px", width: "100%" }}
                          >
                            <Box sx={{ position: "relative", mb: 3 }}>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: { xs: 120, md: 180 },
                                  background: `url(${PROFILE_BANNER_URL}) center/cover no-repeat`,
                                  borderTopLeftRadius: 16,
                                  borderTopRightRadius: 16,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                              />
                              <Box sx={{ position: "absolute", left: "50%", bottom: -60, transform: "translateX(-50%)", zIndex: 2 }}>
                                <Avatar
                                  src={profile.photoURL}
                                  sx={{
                                    width: 120,
                                    height: 120,
                                    border: "4px solid #fff",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    fontSize: "3rem",
                                    fontWeight: 600,
                                    zIndex: 2,
                                    cursor: "pointer"
                                  }}
                                >
                                  {displayName?.charAt(0).toUpperCase() || "U"}
                                </Avatar>
                                <IconButton
                                  component="label"
                                  sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                    background: "rgba(255,255,255,0.85)",
                                    boxShadow: 1,
                                    zIndex: 3,
                                    '&:hover': { background: "#f0f0f0" }
                                  }}
                                  size="small"
                                >
                                  <PhotoCamera fontSize="small" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleAvatarChange}
                                  />
                                </IconButton>
                              </Box>
                            </Box>
                          </motion.div>
                          <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                            {editingField === 'displayName' ? (
                              <TextField
                                inputRef={displayNameRef}
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                onBlur={e => handleInlineSave('displayName', e.target.value)}
                                onKeyDown={e => handleInlineKey(e, 'displayName')}
                                size="small"
                                autoFocus
                                sx={{ minWidth: 120 }}
                                variant="standard"
                              />
                            ) : (
                              <>
                                {displayName}
                                <EditIcon fontSize="small" sx={{ ml: 1, opacity: 0.6 }} />
                              </>
                            )}
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
                          {memberSince ? memberSince.toLocaleDateString() : "-"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaClock style={{ color: "#667eea" }} />
                          <Typography variant="body2">Last Sign In</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {lastSignIn ? lastSignIn.toLocaleDateString() : "-"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaTasks style={{ color: "#667eea" }} />
                          <Typography variant="body2">Days Active</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {memberSince ? getDaysSinceCreation() : "-"}
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
                        onClick={() => setChangeEmailOpen(true)}
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
                      {earnedBadges.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No achievements yet. Start completing tasks to earn badges!</Typography>
                      )}
                      {earnedBadges.map((badge, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Chip label={badge.label} color={badge.color} size="medium" icon={badge.icon} />
                          <Typography variant="body2">{badge.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
      <Dialog open={changeEmailOpen} onClose={() => setChangeEmailOpen(false)}>
        <DialogTitle>Change Email</DialogTitle>
        <DialogContent>
          <TextField
            label="New Email"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            disabled={emailLoading}
            error={!!emailError}
            helperText={emailError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangeEmailOpen(false)} disabled={emailLoading}>Cancel</Button>
          <Button onClick={handleChangeEmail} disabled={emailLoading || !newEmail} variant="contained">
            {emailLoading ? "Updating..." : "Update Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile; 