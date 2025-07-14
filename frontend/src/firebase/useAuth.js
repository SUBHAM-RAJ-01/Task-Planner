import { useState, useEffect, createContext, useContext } from "react";
import { getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";
import { useFirebase } from "./FirebaseAppProvider";
import { clearUserData } from "../utils/storage";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);
  const [auth, setAuth] = useState(null);
  const [messaging, setMessaging] = useState(null);
  const { app, isInitialized } = useFirebase();

  // Initialize Firebase Auth using the app from FirebaseAppProvider
  useEffect(() => {
    console.log("AuthProvider: Starting Firebase Auth initialization");
    
    if (!isInitialized || !app) {
      console.log("Waiting for Firebase app to be initialized");
      return;
    }

    console.log("Firebase app is ready, initializing Auth");
    
    try {
      const authInstance = getAuth(app);
      
      // Set persistence to LOCAL to maintain auth state across page refreshes
      setPersistence(authInstance, browserLocalPersistence)
        .then(() => {
          console.log("Auth persistence set to LOCAL");
        })
        .catch((error) => {
          console.warn("Failed to set auth persistence:", error);
        });
      
      setAuth(authInstance);
      
      // Initialize messaging only if we have a valid app
      try {
        const messagingInstance = getMessaging(app);
        setMessaging(messagingInstance);
      } catch (error) {
        console.warn("Firebase messaging not available:", error.message);
      }
    } catch (error) {
      console.error("Firebase Auth initialization failed:", error);
      toast.error("Failed to initialize Firebase Auth. Please check your configuration.");
      setLoading(false);
    }
  }, [app, isInitialized]);

  // Initialize FCM token
  useEffect(() => {
    if (!messaging) return;

    const initializeFCM = async () => {
      try {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          return;
        }

        // Check current permission status
        let permission = Notification.permission;
        
        // Only request permission if not already granted or denied
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        
        if (permission !== 'granted') {
          if (permission === 'denied') {
            console.warn('Notification permission denied by user');
            // Don't show error toast for denied permissions to avoid spam
          } else {
            console.warn('Notification permission not granted');
          }
          return;
        }

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        if (token) {
          setFcmToken(token);
          localStorage.setItem('fcmToken', token);
          console.log('FCM Token:', token);
          
          // Send token to backend
          try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ token })
            });
            
            if (response.ok) {
              toast.success('Notifications enabled successfully! 🔔');
            } else {
              console.warn('Failed to send FCM token to backend');
            }
          } catch (error) {
            console.warn('Error sending FCM token to backend:', error);
          }
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
        // Only show error for non-permission related issues
        if (!error.message.includes('permission')) {
          toast.error('Failed to enable notifications. Please check your browser settings.');
        }
      }
    };

    initializeFCM();

    // Handle incoming messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        
        // Show notification
        if (payload.notification) {
          toast.info(`${payload.notification.title}: ${payload.notification.body}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });

      return () => unsubscribe();
    }
  }, [messaging]);

  // Auth state listener
  useEffect(() => {
    console.log("Auth state listener - auth:", auth);
    
    if (!auth) {
      console.log("No auth instance, setting loading to false");
      setLoading(false);
      return;
    }

    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        setUser(user);
        localStorage.setItem("token", user.uid);
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const signIn = async (email, password) => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully! 🎉");
      return result.user;
    } catch (error) {
      console.error("Sign-in error:", error);
      let message = "Sign-in failed";
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = "No account found with this email";
          break;
        case 'auth/wrong-password':
          message = "Incorrect password";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address";
          break;
        case 'auth/too-many-requests':
          message = "Too many failed attempts. Please try again later";
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully! 🎉");
      return result.user;
    } catch (error) {
      console.error("Sign-up error:", error);
      let message = "Sign-up failed";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = "An account with this email already exists";
          break;
        case 'auth/weak-password':
          message = "Password should be at least 6 characters";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address";
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success("Signed in with Google successfully! 🎉");
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      let message = "Google sign-in failed";
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = "Sign-in cancelled";
      } else if (error.code === 'auth/popup-blocked') {
        message = "Pop-up blocked. Please allow pop-ups for this site";
      }
      
      toast.error(message);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    try {
      await firebaseSignOut(auth);
      // Clear user data from localStorage
      if (user?.uid) {
        clearUserData(user.uid);
      }
      toast.success("Signed out successfully! 👋");
    } catch (error) {
      console.error("Sign-out error:", error);
      toast.error("Failed to sign out");
      throw error;
    }
  };

  const resetPassword = async (email) => {
    if (!auth) {
      throw new Error("Firebase not initialized");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent successfully!");
    } catch (error) {
      console.error("Password reset error:", error);
      let message = "Failed to send password reset email";
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = "No account found with this email address";
          break;
        case 'auth/invalid-email':
          message = "Invalid email address";
          break;
        case 'auth/too-many-requests':
          message = "Too many requests. Please try again later";
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  };

  const updateEmail = async (newEmail) => {
    if (!user || !newEmail) throw new Error("No user or email");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update email");
      }
      const data = await res.json();
      setUser(prev => ({ ...prev, email: data.user.email }));
      toast.success("Email updated successfully!");
      return data.user.email;
    } catch (err) {
      toast.error(err.message || "Failed to update email");
      throw err;
    }
  };

  const value = {
    user,
    loading,
    fcmToken,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 