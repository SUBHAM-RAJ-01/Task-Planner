import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Alert, 
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  Chip
} from "@mui/material";
import { useAuth } from "../firebase/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { 
  FaGoogle, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaRocket,
  FaSparkles
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import styles from "./Login.module.css";
import Loader from "../components/Loader";
import { useTheme } from '@mui/material/styles';

function Login() {
  const { user, loading: authLoading, signInWithGoogle, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to SmartPlan! 🚀");
      console.log("Google sign-in completed, navigating to dashboard");
      navigate("/");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to sign in with Google");
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back! 🎉");
      navigate("/");
    } catch (err) {
      setError(err.message);
      toast.error("Invalid email or password");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset email sent.");
      toast.success("Password reset email sent! 📧");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to send reset email");
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return <Loader fullScreen />;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: theme.palette.primary.main + '22',
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        animate={{
          rotate: -360,
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "300px",
          height: "300px",
          background: theme.palette.secondary.main + '22',
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              background: theme.palette.background.paper,
              border: "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            }}
          >
            <motion.div variants={itemVariants}>
              <Box textAlign="center" mb={4}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{ display: "inline-block", marginBottom: "16px" }}
                >
                  <FaRocket style={{ fontSize: "3rem", color: theme.palette.primary.main }} />
                </motion.div>
                <Typography 
                  variant="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}
                >
                  SmartPlan
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Your AI-powered productivity companion
                </Typography>
              </Box>
            </motion.div>

            <motion.div variants={itemVariants}>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              {message && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}
            </motion.div>

            {!resetMode ? (
              <>
                <motion.div variants={itemVariants}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleGoogle}
                    disabled={loading}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      background: "linear-gradient(135deg, #4285f4 0%, #34a853 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #3367d6 0%, #2d8f47 100%)",
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <FaGoogle style={{ fontSize: "1.2rem" }} />
                    Continue with Google
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      or
                    </Typography>
                  </Divider>
                </motion.div>

                <motion.form variants={itemVariants} onSubmit={handleSignIn}>
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdEmail color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaLock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !email || !password}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                      },
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.form>

                <motion.div variants={itemVariants}>
                  <Button
                    color="secondary"
                    fullWidth
                    onClick={() => setResetMode(true)}
                    sx={{ textTransform: "none" }}
                  >
                    Forgot password?
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Typography variant="h6" gutterBottom textAlign="center">
                    Reset Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                    Enter your email to receive a password reset link
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdEmail color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleReset}
                    disabled={loading || !email}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {loading ? "Sending..." : "Send Reset Email"}
                  </Button>
                  <Button
                    color="secondary"
                    fullWidth
                    onClick={() => setResetMode(false)}
                    sx={{ textTransform: "none" }}
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Login; 