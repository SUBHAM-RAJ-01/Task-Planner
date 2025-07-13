import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import { initializeFCM, onMessageListener } from "./fcm";
import { toast } from "react-toastify";

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseAppProvider");
  }
  return context;
};

export const FirebaseAppProvider = ({ children }) => {
  const [app, setApp] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const initializeFirebase = async () => {
      console.log("FirebaseAppProvider: Starting initialization");
      
      // Add a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn("Firebase initialization timeout, forcing completion");
        setIsInitialized(true);
      }, 10000); // 10 second timeout
      
      try {
        const firebaseConfig = {
          apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.REACT_APP_FIREBASE_APP_ID,
          measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
        };

        // Check if all required config values are present
        const requiredKeys = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_PROJECT_ID'];
        const isConfigValid = requiredKeys.every(key => process.env[key] && process.env[key] !== "demo-api-key");
        
        console.log("FirebaseAppProvider: Config valid:", isConfigValid);
        
        if (!isConfigValid) {
          console.error("Firebase configuration incomplete. Please set up your Firebase config in .env file.");
          toast.error("Firebase configuration missing. Please check your environment variables.");
          clearTimeout(timeout);
          setIsInitialized(true);
          return;
        }

        try {
          console.log("FirebaseAppProvider: Initializing Firebase app");
          const firebaseApp = initializeApp(firebaseConfig);
          setApp(firebaseApp);
          console.log("FirebaseAppProvider: Firebase app initialized");

          // Initialize FCM
          console.log("FirebaseAppProvider: Initializing FCM");
          const fcmInitialized = await initializeFCM(firebaseApp);
          if (fcmInitialized) {
            console.log("Firebase and FCM initialized successfully");
            
            // Set up message listener
            try {
              onMessageListener();
              console.log("Message listener set up successfully");
            } catch (err) {
              console.error("Error setting up message listener:", err);
            }
          } else {
            console.warn("FCM initialization failed, but Firebase is ready");
          }
        } catch (error) {
          console.error("Error initializing Firebase app:", error);
          toast.error("Failed to initialize Firebase. Please check your configuration.");
        }

        console.log("FirebaseAppProvider: Setting isInitialized to true");
        clearTimeout(timeout);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        toast.error("Failed to initialize Firebase");
        clearTimeout(timeout);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeFirebase();
  }, []);

  const value = {
    app,
    isInitialized,
  };

  if (!isInitialized) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <div style={{
          textAlign: "center",
          color: "white",
        }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "3px solid rgba(255,255,255,0.3)",
            borderTop: "3px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }} />
          <p>Initializing SmartPlan...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};