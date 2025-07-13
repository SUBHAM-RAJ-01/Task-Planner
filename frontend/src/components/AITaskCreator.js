import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaRobot,
  FaClock,
  FaBell,
  FaCalendarAlt,
  FaLightbulb,
  FaCheck,
  FaTimes,
  FaExpandAlt,
  FaCompressAlt
} from 'react-icons/fa';
import AIService from '../services/aiService';

const AITaskCreator = ({ onTaskCreated }) => {
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    preferredHours: [9, 10, 11, 14, 15, 16],
    notificationAdvance: 30,
    workHours: { start: 9, end: 17 }
  });

  const handleCreateTask = async () => {
    if (!taskInput.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating AI task with input:', taskInput);
      
      // Create task using AI
      const result = await AIService.createTaskFromNaturalLanguage(taskInput, userPreferences);
      
      console.log('AI task creation result:', result);
      
      setAiAnalysis(result.aiAnalysis);
      
      toast.success(`Task created successfully! ${result.notificationScheduled ? 'Notification scheduled 30 minutes before task.' : ''}`);
      
      // Call parent callback
      if (onTaskCreated) {
        onTaskCreated(result.task);
      }
      
      // Clear input
      setTaskInput('');
      
    } catch (error) {
      console.error('AI task creation error:', error);
      toast.error(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async (quickTask) => {
    setTaskInput(quickTask);
    await handleCreateTask();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const quickTasks = [
    "Review project proposal by tomorrow",
    "Call client at 2pm today",
    "Prepare presentation for Friday meeting",
    "Send follow-up emails this afternoon",
    "Update documentation by end of week"
  ];

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      mb: 3
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FaRobot style={{ fontSize: '2rem', color: '#667eea' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            AI Task Creator
          </Typography>
          <Chip 
            label="AI Powered" 
            color="primary" 
            size="small"
            icon={<FaLightbulb />}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Describe your task in natural language. AI will automatically categorize, prioritize, 
          schedule, and set up notifications 30 minutes before your task.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., 'Review quarterly reports by Friday 3pm' or 'Call John tomorrow morning about the project'"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleCreateTask}
              disabled={loading || !taskInput.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <FaRobot />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {loading ? 'Creating Task...' : 'Create Smart Task'}
            </Button>
            
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{ color: '#667eea' }}
            >
              {expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </IconButton>
          </Box>
        </Box>

        {/* Quick Task Examples */}
        <Collapse in={expanded}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaLightbulb style={{ color: '#667eea' }} />
              Quick Examples
            </Typography>
            <Grid container spacing={1}>
              {quickTasks.map((task, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickCreate(task)}
                    disabled={loading}
                    sx={{ 
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      height: 'auto',
                      py: 1,
                      px: 2
                    }}
                  >
                    {task}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                AI Analysis Complete! 🎉
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaCalendarAlt style={{ color: '#667eea' }} />
                    Task Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Category:</Typography>
                      <Chip label={aiAnalysis.category} size="small" />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Priority:</Typography>
                      <Chip 
                        label={aiAnalysis.priority} 
                        color={getPriorityColor(aiAnalysis.priority)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Estimated Time:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {aiAnalysis.estimatedTime} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">AI Confidence:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(aiAnalysis.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaClock style={{ color: '#667eea' }} />
                    Scheduling
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Scheduled Time:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(aiAnalysis.optimalSchedule.scheduledTime)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Reason:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {aiAnalysis.optimalSchedule.reason}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Confidence:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(aiAnalysis.optimalSchedule.confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {aiAnalysis.notificationSchedule && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaBell style={{ color: '#667eea' }} />
                      Notification Scheduled
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Notification Time:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatTime(aiAnalysis.notificationSchedule.notificationTime)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Advance Notice:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {aiAnalysis.notificationSchedule.advanceMinutes} minutes
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Message:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {aiAnalysis.notificationSchedule.message}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default AITaskCreator; 