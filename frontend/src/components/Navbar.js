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
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

          {/* Nav buttons for medium+ screens */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center", gap: 1, flex: 1, justifyContent: 'center' }}>
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

          {/* Hamburger for small screens - move to right, just left of avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', zIndex: 1201, mr: 1 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ border: 'none', background: 'none', p: 0 }}
              >
                <MenuIcon sx={{ color: '#667eea' }} />
              </IconButton>
            </Box>
            {/* User Avatar/Menu (always visible) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: { xs: 1, md: 0 } }}>
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
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer for mobile nav */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box
          sx={{ width: 240, p: 2 }}
          role="presentation"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
            Menu
          </Typography>
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? "#667eea" : "#4a5568",
                justifyContent: 'flex-start',
                width: '100%',
                mb: 1,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
                borderRadius: 2,
                background: location.pathname === item.path 
                  ? "rgba(102, 126, 234, 0.1)" 
                  : "transparent",
                "&:hover": {
                  background: "rgba(102, 126, 234, 0.1)",
                },
                gap: 1,
              }}
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Drawer>
    </motion.div>
  );
}

export default Navbar; 