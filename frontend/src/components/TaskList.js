import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaFlag,
  FaTasks,
  FaCheckCircle,
  FaCircle,
  FaStar,
  FaRegStar,
  FaRobot,
  FaLightbulb
} from "react-icons/fa";
import { MdPriorityHigh, MdLowPriority } from "react-icons/md";
import { useAuth } from "../firebase/useAuth";
import AIService from "../services/aiService";
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import Loader from "./Loader";

const TaskList = ({ onTasksChange }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [sortBy, setSortBy] = useState("date"); // date, priority, name
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiTask, setAiTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  const token = localStorage.getItem("token");
  const api = process.env.REACT_APP_BACKEND_URL;

  // Load tasks from localStorage on component mount
  useEffect(() => {
    if (!token) return;

    const savedTasks = loadFromStorage(storageKeys.TASKS, user?.uid, null, 'tasks');
    if (savedTasks) {
      setTasks(savedTasks);
    } else {
      // Load sample tasks if no saved data
      loadSampleTasks();
    }
  }, [token, user?.uid]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (user?.uid && tasks.length > 0) {
      saveToStorage(storageKeys.TASKS, tasks, user.uid);
    }
    
    // Notify parent component about task changes
    if (onTasksChange) {
      onTasksChange(tasks);
    }
  }, [tasks, user?.uid, onTasksChange]);

  const loadSampleTasks = () => {
    const sampleTasks = [
      {
        id: 1,
        title: "Complete project proposal",
        description: "Write and submit the quarterly project proposal",
        priority: "high",
        dueDate: "2024-01-20",
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Review team performance",
        description: "Analyze team metrics and prepare review",
        priority: "medium",
        dueDate: "2024-01-25",
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Update documentation",
        description: "Update API documentation and user guides",
        priority: "low",
        dueDate: "2024-01-30",
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
    setTasks(sampleTasks);
  };

  // AI-powered task creation
  const handleAICreateTask = async () => {
    if (!aiTask.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    setAiLoading(true);
    try {
      const smartTask = await AIService.createSmartTask(aiTask);
      
      const newTask = {
        id: Date.now(),
        title: smartTask.title,
        description: aiTask,
        priority: smartTask.priority,
        category: smartTask.category,
        estimatedTime: smartTask.estimatedTime,
        dueDate: smartTask.extractedDate || new Date().toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString(),
        aiConfidence: smartTask.confidence
      };

      setTasks(prev => [...prev, newTask]);
      setAiTask("");
      setShowAiDialog(false);
      
      toast.success(`AI created task: ${smartTask.title} (${smartTask.priority} priority)`);
    } catch (error) {
      console.error("AI task creation error:", error);
      toast.error("Failed to create AI task. Creating basic task instead.");
      
      // Fallback to basic task creation
      const basicTask = {
        id: Date.now(),
        title: aiTask.trim(),
        description: "",
        priority: "medium",
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setTasks(prev => [...prev, basicTask]);
      setAiTask("");
      setShowAiDialog(false);
    }
    setAiLoading(false);
  };

  // Get AI insights
  const getAIInsights = async () => {
    setAiLoading(true);
    try {
      const insights = await AIService.getInsights(tasks, []);
      setAiInsights(insights);
      toast.success("AI insights generated!");
    } catch (error) {
      console.error("AI insights error:", error);
      toast.error("Failed to generate AI insights");
    }
    setAiLoading(false);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const task = {
        id: Date.now(),
        title: newTask.trim(),
        description: "",
        priority: newTaskPriority,
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString()
      };

      setTasks(prev => [...prev, task]);
      setNewTask("");
      setNewTaskPriority("medium");
      toast.success("Task added successfully! ✅");
    } catch (error) {
      toast.error("Failed to add task");
    }
    setLoading(false);
  };

  const handleToggleComplete = async (taskId) => {
    try {
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      ));
      
      const task = tasks.find(t => t.id === taskId);
      const status = task.completed ? "incomplete" : "completed";
      toast.success(`Task marked as ${status}! ${task.completed ? "🔄" : "✅"}`);
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleEditTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newTitle = prompt("Edit task title", task.title);
    if (!newTitle || newTitle.trim() === "") return;

    try {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, title: newTitle.trim() } : t
      ));
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handlePriorityChange = async (taskId, priority) => {
    try {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, priority } : task
      ));
      toast.success(`Priority updated to ${priority}`);
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <MdPriorityHigh style={{ color: "#f56565" }} />;
      case "medium":
        return <FaFlag style={{ color: "#ed8936" }} />;
      case "low":
        return <MdLowPriority style={{ color: "#48bb78" }} />;
      default:
        return <FaFlag style={{ color: "#ed8936" }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f56565";
      case "medium":
        return "#ed8936";
      case "low":
        return "#48bb78";
      default:
        return "#ed8936";
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "name":
        return a.title.localeCompare(b.title);
      case "date":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const activeCount = totalCount - completedCount;

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
    return <Loader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              <FaTasks style={{ marginRight: "12px", color: "#667eea" }} />
              Task Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Organize your tasks and boost productivity
            </Typography>
            
            {/* Stats */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
              <Chip
                label={`${totalCount} Total`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${activeCount} Active`}
                color="warning"
                variant="outlined"
              />
              <Chip
                label={`${completedCount} Completed`}
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    <FaPlus style={{ marginRight: "8px", color: "#667eea" }} />
                    Add New Task
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", flexWrap: 'wrap',
                    '@media (max-width: 600px)': {
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 1,
                    }
                  }}>
                    <TextField
                      label="Task Title"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      fullWidth
                      variant="outlined"
                      placeholder="Enter task title..."
                      onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                    />
                    <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                      <InputLabel id="priority-label">Priority</InputLabel>
                      <Select
                        labelId="priority-label"
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value)}
                        label="Priority"
                      >
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={handleAddTask}
                      disabled={loading || !newTask.trim()}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        minWidth: "120px"
                      }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Add Task"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Filters */}
              <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant={filter === "all" ? "contained" : "outlined"}
                  onClick={() => setFilter("all")}
                  size="small"
                >
                  All ({totalCount})
                </Button>
                <Button
                  variant={filter === "active" ? "contained" : "outlined"}
                  onClick={() => setFilter("active")}
                  size="small"
                >
                  Active ({activeCount})
                </Button>
                <Button
                  variant={filter === "completed" ? "contained" : "outlined"}
                  onClick={() => setFilter("completed")}
                  size="small"
                >
                  Completed ({completedCount})
                </Button>
              </Box>

              {/* Task List */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    <FaTasks style={{ marginRight: "8px", color: "#667eea" }} />
                    Tasks ({filteredTasks.length})
                  </Typography>

                  {sortedTasks.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <FaTasks style={{ fontSize: "3rem", color: "#667eea", marginBottom: "16px" }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No tasks found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filter === "all" ? "Add your first task to get started!" : `No ${filter} tasks`}
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      <AnimatePresence>
                        {sortedTasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ListItem
                              sx={{
                                border: "1px solid rgba(0,0,0,0.1)",
                                borderRadius: 2,
                                mb: 2,
                                background: task.completed ? "rgba(76, 175, 80, 0.1)" : "rgba(255, 255, 255, 0.8)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateX(4px)",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                },
                                opacity: task.completed ? 0.7 : 1,
                                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  checked={task.completed}
                                  onChange={() => handleToggleComplete(task.id)}
                                  icon={<FaCircle style={{ color: "#ccc" }} />}
                                  checkedIcon={<FaCheckCircle style={{ color: "#4caf50" }} />}
                                />
                              </ListItemIcon>
                              
                              <ListItemText
                                primary={
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 600,
                                        textDecoration: task.completed ? "line-through" : "none",
                                        color: task.completed ? "text.secondary" : "text.primary"
                                      }}
                                    >
                                      {task.title}
                                    </Typography>
                                    <Chip
                                      label={task.priority}
                                      size="small"
                                      sx={{
                                        backgroundColor: getPriorityColor(task.priority),
                                        color: "white",
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    {task.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {task.description}
                                      </Typography>
                                    )}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <FaCalendarAlt style={{ fontSize: "0.8rem", color: "#667eea" }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <FaClock style={{ fontSize: "0.8rem", color: "#667eea" }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Created: {new Date(task.createdAt).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                }
                              />
                              
                              <ListItemSecondaryAction
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  position: 'static',
                                  marginLeft: { xs: 'auto', sm: 2 },
                                  marginTop: { xs: 1, sm: 0 },
                                  justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                                  width: { xs: '100%', sm: 'auto' },
                                }}
                              >
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => handleEditTask(task.id)} sx={{ fontSize: { xs: 16, sm: 20 }, color: { xs: '#1976d2', sm: '#667eea' } }}>
                                    <FaEdit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDeleteTask(task.id)} sx={{ fontSize: { xs: 16, sm: 20 }, color: { xs: '#d32f2f', sm: '#f56565' } }}>
                                    <FaTrash />
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              {/* Priority Management */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    <FaFlag style={{ marginRight: "8px", color: "#667eea" }} />
                    Priority Management
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {["high", "medium", "low"].map((priority) => (
                      <Box key={priority} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getPriorityIcon(priority)}
                          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                            {priority}
                          </Typography>
                        </Box>
                        <Chip
                          label={tasks.filter(t => t.priority === priority).length}
                          size="small"
                          sx={{ backgroundColor: getPriorityColor(priority), color: "white" }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    <FaCheck style={{ marginRight: "8px", color: "#667eea" }} />
                    Quick Actions
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FaCheck />}
                      onClick={() => {
                        setTasks(prev => prev.map(task => ({ ...task, completed: true })));
                        toast.success("All tasks marked as completed! 🎉");
                      }}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Complete All
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FaCircle />}
                      onClick={() => {
                        setTasks(prev => prev.map(task => ({ ...task, completed: false })));
                        toast.success("All tasks marked as active! 🔄");
                      }}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Activate All
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FaTrash />}
                      onClick={() => {
                        setTasks(prev => prev.filter(task => !task.completed));
                        toast.success("Completed tasks cleared! 🗑️");
                      }}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Clear Completed
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      {/* AI Insights Section */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "20px" }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FaLightbulb style={{ color: "#667eea" }} />
                AI Insights
              </Typography>
              {aiInsights.insights.map((insight, index) => (
                <Alert key={index} severity={insight.type} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2">
                    {insight.message}
                  </Typography>
                </Alert>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Task Creation Dialog */}
      <Dialog open={showAiDialog} onClose={() => setShowAiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaRobot style={{ color: "#667eea" }} />
          AI-Powered Task Creation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe your task in natural language. AI will automatically:
            • Extract task title and priority
            • Estimate completion time
            • Suggest optimal scheduling
            • Categorize the task
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., 'I need to finish the quarterly report by Friday, it's urgent and will take about 3 hours'"
            value={aiTask}
            onChange={(e) => setAiTask(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAiDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAICreateTask}
            disabled={aiLoading || !aiTask.trim()}
            startIcon={aiLoading ? <CircularProgress size={16} /> : <FaRobot />}
          >
            {aiLoading ? "Creating..." : "Create with AI"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList; 