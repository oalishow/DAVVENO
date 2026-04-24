importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBFcRLevakBzbIrO1TZinHoCNmk7oymt6E",
  authDomain: "gen-lang-client-0807701307.firebaseapp.com",
  projectId: "gen-lang-client-0807701307",
  storageBucket: "gen-lang-client-0807701307.firebasestorage.app",
  messagingSenderId: "161033427963",
  appId: "1:161033427963:web:fce93195531f2ee448095e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
