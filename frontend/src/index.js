import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { FirebaseAppProvider } from "./firebase/FirebaseAppProvider";
import { AuthProvider } from "./firebase/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Ensure Material-UI is properly initialized
import { StyledEngineProvider } from '@mui/material/styles';

// Add Google Fonts
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <FirebaseAppProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastStyle={{
                borderRadius: "12px",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </FirebaseAppProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register(); 