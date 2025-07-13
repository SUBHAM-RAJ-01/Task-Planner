import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

let messaging = null;

export const initializeFCM = async (app) => {
  try {
    if (!app) {
      console.error("Firebase app not initialized");
      return false;
    }

    // Check if the browser supports service workers
    if (!('serviceWorker' in navigator)) {
      console.warn("Service Worker not supported");
      toast.warn("Push notifications not supported in this browser");
      return false;
    }

    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.warn("Notifications not supported");
      toast.warn("Push notifications not supported in this browser");
      return false;
    }

    messaging = getMessaging(app);
    
    // Check current permission status
    let permission = Notification.permission;
    
    // Only request permission if not already granted or denied
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      if (permission === 'denied') {
        console.warn("Notification permission denied by user");
        toast.warn("Notifications are disabled. You can enable them in your browser settings.");
      } else if (permission === 'default') {
        console.warn("Notification permission not granted");
        toast.info("Please enable notifications to receive updates");
      }
      return false;
    }

    console.log("FCM initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing FCM:", error);
    toast.error("Failed to initialize push notifications");
    return false;
  }
};

export const requestFcmToken = async () => {
  try {
    if (!messaging) {
      console.error("FCM not initialized");
      toast.error("Push notifications not initialized");
      return null;
    }

    // Check if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.warn("Service Worker not registered");
      toast.warn("Please refresh the page to enable notifications");
      return null;
    }

    // Get the token
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FCM_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      console.error("Failed to get FCM token");
      toast.error("Failed to get notification token");
      return null;
    }

    console.log("FCM token obtained:", token);
    localStorage.setItem('fcmToken', token);
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    
    // Provide specific error messages based on the error
    if (error.code === 'messaging/permission-blocked') {
      toast.error("Please enable notifications in your browser settings");
    } else if (error.code === 'messaging/registration-token-not-supported') {
      toast.error("Push notifications not supported in this browser");
    } else if (error.code === 'messaging/invalid-vapid-key') {
      toast.error("Push notification configuration error");
    } else {
      toast.error("Failed to enable push notifications");
    }
    
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    console.warn("FCM not initialized for message listener");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    
    // Show toast notification
    toast.info(payload.notification?.body || "New notification received!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title || "SmartPlan", {
        body: payload.notification?.body || "You have a new notification",
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: "smartplan-notification",
      });
    }
  });
};

export const getStoredFcmToken = () => {
  return localStorage.getItem('fcmToken');
};

export const clearFcmToken = () => {
  localStorage.removeItem('fcmToken');
}; 