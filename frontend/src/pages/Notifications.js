import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { 
  FaBell, 
  FaEnvelope, 
  FaMobile, 
  FaCog, 
  FaTrash,
  FaCheck,
  FaTimes,
  FaInfo,
  FaExclamationTriangle,
  FaRocket
} from "react-icons/fa";
import { MdNotifications, MdSettings } from "react-icons/md";
import { requestFcmToken, getStoredFcmToken } from "../firebase/fcm";
import styles from "./Notifications.module.css";
import { useAuth } from "../firebase/useAuth";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [fcmToken, setFcmToken] = useState(getStoredFcmToken());
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });

  const token = localStorage.getItem("token");
  const api = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!token) return;

    // Load sample notifications
    const sampleNotifications = [
      {
        id: 1,
        title: "Task Completed",
        message: "Great job! You've completed 'Review project proposal'",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        title: "Meeting Reminder",
        message: "Team meeting starts in 15 minutes",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      },
      {
        id: 3,
        title: "Deadline Approaching",
        message: "Project deadline is tomorrow. Don't forget to submit!",
        type: "warning",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false
      },
      {
        id: 4,
        title: "New Feature Available",
        message: "Calendar sync feature is now live!",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true
      }
    ];
    setNotifications(sampleNotifications);
  }, [token]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title, 
          message, 
          fcmToken,
          settings 
        })
      });

      if (res.ok) {
        toast.success("Notification sent successfully! 🎉");
        
        // Add to local notifications
        const newNotification = {
          id: Date.now(),
          type: "info",
          title: title,
          message: message,
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        setTitle("");
        setMessage("");
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      toast.error("Failed to send notification");
    }
    setLoading(false);
  };

  const handleEnablePush = async () => {
    try {
      const token = await requestFcmToken();
      if (token) {
        setFcmToken(token);
        toast.success("Push notifications enabled! 🔔");
      }
    } catch (err) {
      console.error("Error enabling push notifications:", err);
      toast.error("Failed to enable push notifications");
    }
  };

  const handleToggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast.success("Notification deleted");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success": return <FaCheck />;
      case "warning": return <FaExclamationTriangle />;
      case "error": return <FaTimes />;
      default: return <FaInfo />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success": return "#48bb78";
      case "warning": return "#ed8936";
      case "error": return "#f56565";
      default: return "#4299e1";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
                <FaBell style={{ fontSize: "3rem", color: "#fff" }} />
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
                Notifications
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Stay updated with your productivity
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
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <MdNotifications style={{ color: "#667eea" }} />
                      Send Notification
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Notification Title"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Notification Message"
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSendNotification}
                        disabled={loading || !title.trim() || !message.trim()}
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        {loading ? "Sending..." : "Send Notification"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleEnablePush}
                        startIcon={<FaBell />}
                      >
                        Enable Push Notifications
                      </Button>
                    </Box>

                    {fcmToken && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Push notifications are enabled! Token: {fcmToken.substring(0, 20)}...
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaBell style={{ color: "#667eea" }} />
                      Recent Notifications
                    </Typography>
                    
                    <List>
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItem
                            sx={{
                              border: notification.read ? "none" : "2px solid #667eea",
                              borderRadius: 2,
                              mb: 1,
                              background: notification.read ? "transparent" : "rgba(102, 126, 234, 0.05)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateX(4px)",
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: getNotificationColor(notification.type),
                                color: "white"
                              }}>
                                {getNotificationIcon(notification.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {notification.title}
                                  </Typography>
                                  {!notification.read && (
                                    <Chip label="New" size="small" color="primary" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {notification.message}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTimeAgo(notification.timestamp)}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {!notification.read && (
                                <IconButton
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  size="small"
                                  sx={{ color: "#667eea" }}
                                >
                                  <FaCheck />
                                </IconButton>
                              )}
                              <IconButton
                                onClick={() => handleDeleteNotification(notification.id)}
                                size="small"
                                sx={{ color: "#f56565" }}
                              >
                                <FaTrash />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < notifications.length - 1 && <Divider />}
                        </motion.div>
                      ))}
                    </List>
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
                      <MdSettings style={{ color: "#667eea" }} />
                      Notification Settings
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {Object.entries(settings).map(([key, value]) => (
                        <Box key={key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                            {key} Notifications
                          </Typography>
                          <Button
                            variant={value ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleToggleSetting(key)}
                            sx={{
                              minWidth: "80px",
                              background: value ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                            }}
                          >
                            {value ? "On" : "Off"}
                          </Button>
                        </Box>
                      ))}
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
                      <FaRocket style={{ color: "#667eea" }} />
                      Quick Stats
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Total Notifications</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {notifications.length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Unread</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#667eea" }}>
                          {notifications.filter(n => !n.read).length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Today</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {notifications.filter(n => {
                            const today = new Date();
                            const notifDate = new Date(n.timestamp);
                            return notifDate.toDateString() === today.toDateString();
                          }).length}
                        </Typography>
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

export default Notifications; 