import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUser,
  FaTasks,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
  FaRocket,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaClock,
  FaCalendarCheck,
  FaStar,
  FaRegStar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLightbulb
} from "react-icons/fa";
import { MdEvent, MdAccessTime, MdLocationOn } from "react-icons/md";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../firebase/useAuth";
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import TaskList from "../components/TaskList";
import AITaskCreator from "../components/AITaskCreator";
import AnalyticsChart from "../components/AnalyticsChart";
import { useNavigate } from "react-router-dom";
import AIService from "../services/aiService";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTheme } from '@mui/material/styles';

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
}

function getWeeklyData(tasks) {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });
  const data = days.map((d) => {
    const dateStr = d.toISOString().split("T")[0];
    const completedCount = tasks.filter(
      (t) => t.completed && t.dueDate && t.dueDate.startsWith(dateStr)
    ).length;
    return { date: d.toLocaleDateString(undefined, { weekday: "short" }), completedCount };
  });
  return data;
}

function getAchievements(tasks, weeklyData) {
  const achievements = [];
  if (tasks.length > 0) {
    achievements.push({
      icon: 'FaCheckCircle',
      color: '#48bb78',
      title: 'First Task',
      desc: 'Completed your first task'
    });
  }
  const completedToday = tasks.filter(t => t.completed && t.dueDate && t.dueDate === new Date().toISOString().split('T')[0]).length;
  if (completedToday >= 5) {
    achievements.push({
      icon: 'FaCheckCircle',
      color: '#48bb78',
      title: 'Task Master',
      desc: `Completed ${completedToday} tasks today` });
  }
  const streak = weeklyData.reduceRight((acc, d) => d.completedCount > 0 ? acc + 1 : (acc > 0 ? acc : 0), 0);
  if (streak >= 3) {
    achievements.push({
      icon: 'FaFire',
      color: '#ed8936',
      title: 'Streak Champion',
      desc: `${streak}-day productivity streak` });
  }
  if (tasks.filter(t => t.completed).length >= 10) {
    achievements.push({
      icon: 'FaStar',
      color: '#667eea',
      title: 'Goal Crusher',
      desc: 'Completed 10+ tasks' });
  }
  if (tasks.filter(t => t.completed).length >= 50) {
    achievements.push({
      icon: 'FaTrophy',
      color: '#ffd700',
      title: 'Legend',
      desc: 'Completed 50+ tasks' });
  }
  return achievements;
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    productivity: 0
  });
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  // Ref for Add Task input
  const addTaskInputRef = React.useRef();
  const [aiSuggestOpen, setAiSuggestOpen] = React.useState(false);
  const [aiSuggestedTask, setAiSuggestedTask] = React.useState(null);
  const [aiSuggestLoading, setAiSuggestLoading] = React.useState(false);
  const theme = useTheme();

  // Load dashboard data from localStorage on component mount
  useEffect(() => {
    if (!user?.uid) return;

    // Load saved stats
    const savedStats = loadFromStorage(storageKeys.DASHBOARD_STATS, user.uid, null, 'stats');
    if (savedStats) {
      setStats(savedStats);
    } else {
      // Load default stats if no saved data
      setStats({
        totalTasks: 12,
        completedTasks: 8,
        pendingTasks: 4,
        totalEvents: 6,
        upcomingEvents: 3,
        productivity: 85
      });
    }
  }, [user?.uid]);

  // Load tasks for weekly progress
  useEffect(() => {
    if (!user?.uid) return;
    const savedTasks = loadFromStorage(storageKeys.TASKS, user.uid, null, 'tasks');
    setTasks(savedTasks || []);
  }, [user?.uid]);

  // Save stats to localStorage whenever stats change
  useEffect(() => {
    if (user?.uid) {
      saveToStorage(storageKeys.DASHBOARD_STATS, stats, user.uid);
    }
  }, [stats, user?.uid]);

  // Handle task changes and update stats
  const handleTasksChange = (tasks) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setStats(prev => ({
      ...prev,
      totalTasks,
      completedTasks,
      pendingTasks,
      productivity
    }));
  };


  const productivityData = [
    { day: "Mon", productivity: 85 },
    { day: "Tue", productivity: 92 },
    { day: "Wed", productivity: 78 },
    { day: "Thu", productivity: 88 },
    { day: "Fri", productivity: 95 },
    { day: "Sat", productivity: 70 },
    { day: "Sun", productivity: 82 }
  ];

  const taskData = [
    { name: "Completed", value: stats.completedTasks, color: "#48bb78" },
    { name: "Pending", value: stats.pendingTasks, color: "#ed8936" }
  ];

  const weeklyData = getWeeklyData(tasks);
  const achievements = getAchievements(tasks, weeklyData);

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
                <FaRocket style={{ fontSize: "3rem", color: theme.palette.primary.main }} />
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
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 🚀
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Let's boost your productivity today
              </Typography>
            </Box>
          </motion.div>

          {/* Task Management Section - Moved Up */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <FaTasks style={{ color: theme.palette.primary.main }} />
                  Task Management
                </Typography>
                <TaskList onTasksChange={handleTasksChange} />
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Task Creator Section */}
          <motion.div variants={itemVariants}>
            <AITaskCreator onTaskCreated={(task) => {
              toast.success(`AI created task: ${task.title}`);
              // Refresh task list or update stats
            }} />
          </motion.div>

          {/* Analytics Section - Moved Down */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <motion.div variants={itemVariants}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaChartLine style={{ color: theme.palette.primary.main }} />
                      Productivity Analytics
                    </Typography>
                    <AnalyticsChart analytics={{
                      typeCounts: {
                        Completed: stats.completedTasks,
                        Pending: stats.pendingTasks
                      },
                      completionRate: stats.totalTasks > 0 ? stats.completedTasks / stats.totalTasks : 0
                    }} weeklyData={weeklyData} />
                    {weeklyData.length > 0 && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        {(() => {
                          const streak = weeklyData.reduceRight((acc, d) => d.completedCount > 0 ? acc + 1 : (acc > 0 ? acc : 0), 0);
                          if (streak >= 5) {
                            return <Chip color="success" label={`🔥 Amazing! ${streak}-day streak!`} sx={{ fontWeight: 600 }} />;
                          } else if (streak >= 3) {
                            return <Chip color="warning" label={`👏 ${streak}-day streak! Keep it up!`} sx={{ fontWeight: 600 }} />;
                          } else if (streak === 0) {
                            return <Chip color="default" label="Start a new streak today!" sx={{ fontWeight: 600 }} />;
                          }
                          return null;
                        })()}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaChartLine style={{ color: theme.palette.primary.main }} />
                      Weekly Progress
                    </Typography>
                    
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={productivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="productivity" 
                          stroke={theme.palette.primary.main} 
                          strokeWidth={3}
                          dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: theme.palette.primary.main, strokeWidth: 2, fill: "#fff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={4}>
              <motion.div variants={itemVariants}>
                {/* Quick Stats */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaTrophy style={{ color: theme.palette.primary.main }} />
                      Quick Stats
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaTasks style={{ color: theme.palette.primary.main }} />
                          <Typography variant="body2">Total Tasks</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stats.totalTasks}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaCheckCircle style={{ color: "#48bb78" }} />
                          <Typography variant="body2">Completed</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stats.completedTasks}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaClock style={{ color: "#ed8936" }} />
                          <Typography variant="body2">Pending</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stats.pendingTasks}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaCalendarAlt style={{ color: theme.palette.primary.main }} />
                          <Typography variant="body2">Events</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stats.totalEvents}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card sx={{ 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 3,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaFire style={{ color: theme.palette.primary.main }} />
                      Recent Achievements
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {achievements.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No achievements yet. Start completing tasks!</Typography>
                      )}
                      {achievements.map((ach, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ bgcolor: ach.color, width: 32, height: 32 }}>
                            {ach.icon === 'FaCheckCircle' && <FaCheckCircle />}
                            {ach.icon === 'FaFire' && <FaFire />}
                            {ach.icon === 'FaStar' && <FaStar />}
                            {ach.icon === 'FaTrophy' && <FaTrophy />}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{ach.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{ach.desc}</Typography>
                          </Box>
                        </Box>
                      ))}
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
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaRocket style={{ color: theme.palette.primary.main }} />
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaPlus />}
                        sx={{ justifyContent: "flex-start" }}
                        onClick={() => {
                          // If on dashboard, scroll to add task input
                          if (window.location.pathname === "/") {
                            const el = document.getElementById("add-task-input");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                            setTimeout(() => { el && el.focus(); }, 500);
                          } else {
                            navigate("/");
                            setTimeout(() => {
                              const el = document.getElementById("add-task-input");
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                              setTimeout(() => { el && el.focus(); }, 500);
                            }, 500);
                          }
                        }}
                      >
                        Add New Task
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaCalendarAlt />}
                        sx={{ justifyContent: "flex-start" }}
                        onClick={() => navigate("/calendar")}
                      >
                        Schedule Event
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaBell />}
                        sx={{ justifyContent: "flex-start" }}
                        onClick={() => navigate("/notifications")}
                      >
                        Set Reminder
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaLightbulb />}
                        sx={{ justifyContent: "flex-start" }}
                        onClick={async () => {
                          setAiSuggestLoading(true);
                          try {
                            const prioritized = await AIService.prioritizeTasks(tasks.filter(t => !t.completed));
                            if (prioritized && prioritized.length > 0) {
                              setAiSuggestedTask(prioritized[0]);
                              setAiSuggestOpen(true);
                            } else {
                              toast.info("No pending tasks to suggest.");
                            }
                          } catch (err) {
                            toast.error("AI suggestion failed.");
                          }
                          setAiSuggestLoading(false);
                        }}
                        disabled={aiSuggestLoading}
                      >
                        {aiSuggestLoading ? "Suggesting..." : "AI Suggest Next Task"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
      {/* AI Suggest Next Task Dialog */}
      <Dialog open={aiSuggestOpen} onClose={() => setAiSuggestOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaLightbulb style={{ color: theme.palette.primary.main }} />
          AI Suggestion
        </DialogTitle>
        <DialogContent>
          {aiSuggestedTask ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>{aiSuggestedTask.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Priority: <strong>{aiSuggestedTask.aiPriority || aiSuggestedTask.priority}</strong>
                {aiSuggestedTask.confidence && (
                  <> &nbsp;|&nbsp; Confidence: <strong>{(aiSuggestedTask.confidence * 100).toFixed(0)}%</strong></>
                )}
              </Typography>
              {aiSuggestedTask.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>{aiSuggestedTask.description}</Typography>
              )}
              {aiSuggestedTask.estimatedTime && (
                <Typography variant="body2">Estimated Time: {aiSuggestedTask.estimatedTime} min</Typography>
              )}
            </Box>
          ) : (
            <Typography>No suggestion available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiSuggestOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard; 