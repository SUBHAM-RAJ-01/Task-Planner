import React, { useEffect, useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaBell,
  FaMapMarkerAlt,
  FaUser,
  FaRocket,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarCheck
} from "react-icons/fa";
import { MdEvent, MdAccessTime, MdLocationOn } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import styles from "./Calendar.module.css";
import EventList from "../components/EventList";
import { useAuth } from "../firebase/useAuth";

function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const token = localStorage.getItem("token");
  const api = process.env.REACT_APP_BACKEND_URL;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    
    // Load sample events
    const sampleEvents = [
      {
        id: 1,
        title: "Team Meeting",
        start: "2024-01-15T10:00:00",
        end: "2024-01-15T11:00:00",
        description: "Weekly team sync meeting",
        location: "Conference Room A",
        type: "meeting"
      },
      {
        id: 2,
        title: "Project Deadline",
        start: "2024-01-20T17:00:00",
        end: "2024-01-20T18:00:00",
        description: "Submit final project deliverables",
        location: "Office",
        type: "deadline"
      },
      {
        id: 3,
        title: "Client Call",
        start: "2024-01-18T14:00:00",
        end: "2024-01-18T15:00:00",
        description: "Discuss project requirements",
        location: "Zoom",
        type: "call"
      }
    ];
    setEvents(sampleEvents);
  }, [token]);

  const handleAdd = async () => {
    if (!title.trim() || !start.trim()) {
      toast.error("Please fill in title and start time");
      return;
    }

    setLoading(true);
    try {
      const newEvent = {
        id: Date.now(),
        title: title.trim(),
        start: start,
        end: end || start,
        description: description.trim(),
        location: location.trim(),
        type: "event"
      };

      setEvents(prev => [...prev, newEvent]);
      setTitle("");
      setStart("");
      setEnd("");
      setDescription("");
      setLocation("");
      toast.success("Event added successfully! 🎉");
    } catch (err) {
      toast.error("Failed to add event");
    }
    setLoading(false);
  };

  const handleDelete = async (event) => {
    try {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast.success("Event deleted successfully");
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleEdit = async (event) => {
    const newTitle = prompt("Edit event title", event.title);
    if (!newTitle) return;
    
    try {
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, title: newTitle } : e
      ));
      toast.success("Event updated successfully");
    } catch (err) {
      toast.error("Failed to update event");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return <FaUser />;
      case 'deadline': return <FaCalendarCheck />;
      case 'call': return <FaBell />;
      default: return <MdEvent />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return '#667eea';
      case 'deadline': return '#f56565';
      case 'call': return '#48bb78';
      default: return '#ed8936';
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
                <FaCalendarAlt style={{ fontSize: "3rem", color: "#667eea" }} />
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
                Calendar
              </Typography>
              <Typography variant="h6" sx={{ color: "#4a5568", mb: 2 }}>
                Manage your schedule and events
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
                      <FaPlus style={{ color: "#667eea" }} />
                      Add New Event
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Event Title"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Location"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Start Date & Time"
                          type="datetime-local"
                          value={start}
                          onChange={e => setStart(e.target.value)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="End Date & Time"
                          type="datetime-local"
                          value={end}
                          onChange={e => setEnd(e.target.value)}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      onClick={handleAdd}
                      disabled={loading || !title.trim() || !start.trim()}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        mt: 2
                      }}
                    >
                      {loading ? "Adding..." : "Add Event"}
                    </Button>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaCalendarAlt style={{ color: "#667eea" }} />
                      Upcoming Events ({events.length})
                    </Typography>
                    
                    {events.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <FaCalendarAlt style={{ fontSize: "3rem", color: "#667eea", marginBottom: "16px" }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No events scheduled
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add your first event to get started!
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {events.map((event, index) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ListItem
                              sx={{
                                border: "1px solid rgba(0,0,0,0.1)",
                                borderRadius: 2,
                                mb: 2,
                                background: "rgba(255, 255, 255, 0.5)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateX(4px)",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ 
                                  bgcolor: getEventTypeColor(event.type),
                                  color: "white"
                                }}>
                                  {getEventTypeIcon(event.type)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {event.title}
                                    </Typography>
                                    <Chip
                                      label={event.type}
                                      size="small"
                                      sx={{
                                        backgroundColor: getEventTypeColor(event.type),
                                        color: "white",
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                      <MdAccessTime style={{ fontSize: "1rem", color: "#667eea" }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {new Date(event.start).toLocaleString()}
                                      </Typography>
                                    </Box>
                                    {event.location && (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <MdLocationOn style={{ fontSize: "1rem", color: "#667eea" }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {event.location}
                                        </Typography>
                                      </Box>
                                    )}
                                    {event.description && (
                                      <Typography variant="body2" color="text.secondary">
                                        {event.description}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                  onClick={() => handleEdit(event)}
                                  sx={{ color: "#667eea" }}
                                >
                                  <FaEdit />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDelete(event)}
                                  sx={{ color: "#f56565" }}
                                >
                                  <FaTrash />
                                </IconButton>
                              </Box>
                            </ListItem>
                          </motion.div>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVariants}>
                {/* Date Widget */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaCalendarDay style={{ color: "#667eea" }} />
                      Today's Date
                    </Typography>
                    
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
                        {currentTime.getDate()}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {formatDate(currentTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Day {Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))} of {currentTime.getFullYear()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Clock Widget */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <IoMdTime style={{ color: "#667eea" }} />
                      Current Time
                    </Typography>
                    
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="h2" sx={{ fontWeight: 700, color: "#667eea", mb: 1, fontFamily: "monospace" }}>
                        {formatTime(currentTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentTime.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaCalendarWeek style={{ color: "#667eea" }} />
                      Calendar Stats
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">Total Events</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {events.length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">This Week</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {events.filter(e => {
                            const eventDate = new Date(e.start);
                            const weekStart = new Date(currentTime);
                            weekStart.setDate(currentTime.getDate() - currentTime.getDay());
                            const weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6);
                            return eventDate >= weekStart && eventDate <= weekEnd;
                          }).length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">This Month</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {events.filter(e => {
                            const eventDate = new Date(e.start);
                            return eventDate.getMonth() === currentTime.getMonth() && 
                                   eventDate.getFullYear() === currentTime.getFullYear();
                          }).length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaRocket style={{ color: "#667eea" }} />
                      Quick Actions
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaPlus />}
                        onClick={() => {
                          const now = new Date();
                          const tomorrow = new Date(now);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          setTitle("New Event");
                          setStart(tomorrow.toISOString().slice(0, 16));
                          setEnd(tomorrow.toISOString().slice(0, 16));
                        }}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Quick Add Event
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaBell />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Set Reminder
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaCalendarAlt />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Export Calendar
                      </Button>
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

export default Calendar; 