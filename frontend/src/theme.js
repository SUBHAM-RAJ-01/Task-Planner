import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#667eea",
      light: "#8b9fff",
      dark: "#4c63d2",
    },
    secondary: {
      main: "#f093fb",
      light: "#f4b5ff",
      dark: "#c664d9",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a202c",
      secondary: "#4a5568",
    },
    success: {
      main: "#48bb78",
      light: "#68d391",
      dark: "#38a169",
    },
    error: {
      main: "#f56565",
      light: "#fc8181",
      dark: "#e53e3e",
    },
    warning: {
      main: "#ed8936",
      light: "#f6ad55",
      dark: "#dd6b20",
    },
    info: {
      main: "#4299e1",
      light: "#63b3ed",
      dark: "#3182ce",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#1a202c",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      color: "#1a202c",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#1a202c",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#1a202c",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
      color: "#1a202c",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.125rem",
      color: "#1a202c",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#4a5568",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#4a5568",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 24px",
          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px 0 rgba(0, 0, 0, 0.15)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
          },
        },
        outlined: {
          border: "2px solid",
          "&:hover": {
            background: "rgba(102, 126, 234, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
            "&.Mui-focused": {
              transform: "translateY(-2px)",
            },
          },
        },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 