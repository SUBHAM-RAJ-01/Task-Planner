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
  FaTrash
} from "react-icons/fa";
import { MdEvent, MdAccessTime, MdLocationOn } from "react-icons/md";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../firebase/useAuth";
import { saveToStorage, loadFromStorage, storageKeys } from "../utils/storage";
import TaskList from "../components/TaskList";
import AITaskCreator from "../components/AITaskCreator";

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
                <FaRocket style={{ fontSize: "3rem", color: "#667eea" }} />
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
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 🚀
              </Typography>
              <Typography variant="h6" sx={{ color: "#4a5568", mb: 2 }}>
                Let's boost your productivity today
              </Typography>
            </Box>
          </motion.div>

          {/* Task Management Section - Moved Up */}
          <motion.div variants={itemVariants}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <FaTasks style={{ color: "#667eea" }} />
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
                      <FaChartLine style={{ color: "#667eea" }} />
                      Productivity Analytics
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: "center", mb: 3 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: "#667eea", mb: 1 }}>
                            {stats.productivity}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Overall Productivity
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={stats.productivity} 
                            sx={{ 
                              mt: 2, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: "rgba(102, 126, 234, 0.2)",
                              "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: 4
                              }
                            }} 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={taskData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {taskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
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
                      <FaChartLine style={{ color: "#667eea" }} />
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
                          stroke="#667eea" 
                          strokeWidth={3}
                          dot={{ fill: "#667eea", strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: "#667eea", strokeWidth: 2, fill: "#fff" }}
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
                      <FaTrophy style={{ color: "#667eea" }} />
                      Quick Stats
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <FaTasks style={{ color: "#667eea" }} />
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
                          <FaCalendarAlt style={{ color: "#667eea" }} />
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
                      <FaFire style={{ color: "#667eea" }} />
                      Recent Achievements
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#48bb78", width: 32, height: 32 }}>
                          <FaCheckCircle />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Task Master
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed 5 tasks today
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#ed8936", width: 32, height: 32 }}>
                          <FaFire />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Streak Champion
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            7-day productivity streak
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>
                          <FaStar />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Goal Crusher
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exceeded weekly targets
                          </Typography>
                        </Box>
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
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                      <FaRocket style={{ color: "#667eea" }} />
                      Quick Actions
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaPlus />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Add New Task
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaCalendarAlt />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Schedule Event
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<FaBell />}
                        sx={{ justifyContent: "flex-start" }}
                      >
                        Set Reminder
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

export default Dashboard; 