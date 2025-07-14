importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCRqg8aC9pozq35a8M7BzTrRUCxz8VY_nU",

  authDomain: "smartplanner-3d5e9.firebaseapp.com",

  projectId: "smartplanner-3d5e9",

  storageBucket: "smartplanner-3d5e9.firebasestorage.app",

  messagingSenderId: "812766093661",

  appId: "1:812766093661:web:dbad2109d8642ff73348b4",

  measurementId: "G-XMYNXZYBLD"
});

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 