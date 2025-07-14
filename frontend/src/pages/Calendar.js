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
  Avatar,
  Select,
  MenuItem,
  InputLabel,
  FormControl
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
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import Loader from "../components/Loader";
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AIService from '../services/aiService';
import { useTheme } from '@mui/material/styles';
import { useFirestoreEvents } from '../hooks/useFirestoreEvents';

function Calendar() {
  const { user } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent } = useFirestoreEvents();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const token = localStorage.getItem("token");
  const api = process.env.REACT_APP_BACKEND_URL;
  const categoryOptions = [
    'Personal', 'Wedding', 'Party', 'Meeting', 'Call', 'Study', 'Skills', 'Exam', 'Presentation', 'Submission', 'Other'
  ];
  const theme = useTheme();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-detect category when title or description changes
  useEffect(() => {
    const detectCategory = async () => {
      if (title.trim() || description.trim()) {
        const cat = await AIService.suggestCategory(title + ' ' + description);
        // Try to match AI suggestion to one of the options
        const match = categoryOptions.find(opt => cat.toLowerCase().includes(opt.toLowerCase()));
        setCategory(match || cat || 'Other');
      }
    };
    detectCategory();
    // eslint-disable-next-line
  }, [title, description]);

  // Helper to combine date and time into a single Date object
  const combineDateAndTime = (date, time) => {
    if (!date || !time) return null;
    const d = new Date(date);
    const t = new Date(time);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  };

  // Event CRUD handlers
  const handleAddEvent = async () => {
    if (!title.trim() || !startDate || !startTime) {
      toast.error('Please fill in all event details');
      return;
    }
    setLoading(true);
    try {
      const start = combineDateAndTime(startDate, startTime);
      const end = new Date(start);
      end.setHours(end.getHours() + 1); // Default: 1 hour event
      const event = {
        title: title.trim(),
        start,
        end,
        description,
        location,
        category,
        type: category || 'event',
        createdAt: new Date().toISOString()
      };
      await addEvent(event);
      setTitle("");
      setStartDate(null);
      setStartTime(null);
      setDescription("");
      setLocation("");
      setCategory('');
      toast.success('Event added successfully!');
    } catch (error) {
      toast.error('Failed to add event');
    }
    setLoading(false);
  };

  const handleEditEvent = async (eventId, oldTitle) => {
    const newTitle = prompt('Edit event title', oldTitle);
    if (!newTitle || newTitle.trim() === "") return;
    try {
      await updateEvent(eventId, { title: newTitle.trim() });
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  // Helper to combine date and time picker values
  const getTimeAsDate = (date, time) => {
    if (!date || !time) return null;
    const d = new Date(date);
    const t = typeof time === 'string' ? new Date(time) : time;
    if (typeof t.getHours === 'function') {
      d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    }
    return d;
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

  // Helper to safely convert Firestore Timestamp or string to JS Date
  const getEventDate = (date) => {
    if (!date) return null;
    if (typeof date.toDate === 'function') return date.toDate();
    return new Date(date);
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

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
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
                <FaCalendarAlt style={{ fontSize: "3rem", color: theme.palette.primary.main }} />
              </motion.div>
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1
                }}
              >
                Calendar
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Manage your schedule and events
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <motion.div variants={itemVariants}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaPlus style={{ color: "#667eea" }} />
                      Add New Event
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Event Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        variant="outlined"
                        placeholder="Enter event title..."
                      />
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          label="Category"
                        >
                          {categoryOptions.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={setStartDate}
                          slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                        />
                        <TimePicker
                          label="Start Time"
                          value={startTime}
                          onChange={setStartTime}
                          slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                        />
                      </LocalizationProvider>
                      <Button
                        variant="contained"
                        onClick={handleAddEvent}
                        disabled={loading || !title.trim() || !startDate || !startTime}
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          mt: 2
                        }}
                      >
                        {loading ? "Adding..." : "Add Event"}
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
                                        {getEventDate(event.start)?.toLocaleString() || 'No date'}
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
                                  onClick={() => handleEditEvent(event.id, event.title)}
                                  sx={{ color: "#667eea" }}
                                >
                                  <FaEdit />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDeleteEvent(event.id)}
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
                            const eventDate = getEventDate(e.start);
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
                            const eventDate = getEventDate(e.start);
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
                          setStartDate(tomorrow);
                          setStartTime(new Date(tomorrow).setHours(9, 0, 0, 0)); // Set to 9 AM
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