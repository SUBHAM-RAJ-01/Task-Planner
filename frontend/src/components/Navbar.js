import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Badge } from "@mui/material";
import { useAuth } from "../firebase/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaHome, 
  FaCalendarAlt, 
  FaBell, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaRocket,
  FaChartLine
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import styles from "./Navbar.module.css";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
    handleClose();
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: <MdDashboard /> },
    { path: "/calendar", label: "Calendar", icon: <FaCalendarAlt /> },
    { path: "/notifications", label: "Notifications", icon: <FaBell /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
    { path: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AppBar 
        position="static" 
        sx={{
          background: "#ffffff",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <FaRocket style={{ fontSize: "2rem", color: "#667eea", marginRight: "8px" }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: "#1a202c",
                }}
              >
                SmartPlan
              </Typography>
            </Box>
          </motion.div>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? "#667eea" : "#4a5568",
                    background: location.pathname === item.path 
                      ? "rgba(102, 126, 234, 0.1)" 
                      : "transparent",
                    borderRadius: "12px",
                    px: 2,
                    py: 1,
                    mx: 0.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(102, 126, 234, 0.1)",
                      transform: "translateY(-2px)",
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {item.label}
                  </span>
                </Button>
              </motion.div>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                onClick={handleMenu}
                sx={{
                  background: "rgba(102, 126, 234, 0.1)",
                  border: "2px solid rgba(102, 126, 234, 0.2)",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.2)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontWeight: 600,
                  }}
                >
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </motion.div>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  background: "#ffffff",
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                  mt: 1,
                },
              }}
            >
              <MenuItem onClick={() => { navigate("/profile"); handleClose(); }}>
                <FaUser style={{ marginRight: "8px" }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate("/settings"); handleClose(); }}>
                <FaCog style={{ marginRight: "8px" }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
                <FaSignOutAlt style={{ marginRight: "8px" }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}

export default Navbar; 