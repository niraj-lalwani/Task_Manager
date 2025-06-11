// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js');

// ✅ Initialize Firebase App FIRST
const firebaseConfig = {
  apiKey: "AIzaSyC7T4l4D9GCINyHeKmDRS5VGKGLJ2zc1Z4",
  authDomain: "taskmanager-8a591.firebaseapp.com",
  databaseURL: "https://taskmanager-8a591-default-rtdb.firebaseio.com",
  projectId: "taskmanager-8a591",
  storageBucket: "taskmanager-8a591.firebasestorage.app",
  messagingSenderId: "794178859203",
  appId: "1:794178859203:web:f563e8c0dd793456be3276"
};

// ✅ Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// ✅ Now it's safe to call messaging
const messaging = firebase.messaging();

// ✅ Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
