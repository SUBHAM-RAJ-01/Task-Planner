import React, { useMemo, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Notifications from "./pages/Notifications";
import ErrorBoundary from "./components/ErrorBoundary";
import { FirebaseAppProvider } from "./firebase/FirebaseAppProvider";
import { AuthProvider } from "./firebase/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoaderProvider } from "./components/LoaderContext";
import RouteChangeLoader from "./components/RouteChangeLoader";
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

function App() {
  const [mode, setMode] = useState('light');
  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    mode,
  }), [mode]);
  const muiTheme = useMemo(() => ({
    ...theme,
    palette: { ...theme.palette, mode, ...(mode === 'dark' ? {
      background: { default: '#181a1b', paper: '#23272f' },
      text: { primary: '#f8fafc', secondary: '#b0b3b8' },
    } : {}) }
  }), [mode]);

  return (
    <ErrorBoundary>
      <FirebaseAppProvider>
        <AuthProvider>
          <LoaderProvider>
            <ColorModeContext.Provider value={colorMode}>
              <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Router>
                  <RouteChangeLoader />
                  <Navbar />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  </Routes>
                  <ToastContainer />
                </Router>
              </ThemeProvider>
            </ColorModeContext.Provider>
          </LoaderProvider>
        </AuthProvider>
      </FirebaseAppProvider>
    </ErrorBoundary>
  );
}

export default App; 