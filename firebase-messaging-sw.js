
// This file must be in the public directory

importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
    apiKey: "AIzaSyBBz1RrkY2XrxW9fSmgvJsAj6ZjKGoUwXw",
    authDomain: "advocate-case-manager.firebaseapp.com",
    databaseURL: "https://advocate-case-manager-default-rtdb.firebaseio.com",
    projectId: "advocate-case-manager",
    storageBucket: "advocate-case-manager.appspot.com",
    messagingSenderId: "74290185621",
    appId: "1:74290185621:web:ea4eea551f2f12b7a8e29c",
    measurementId: "G-4QPJ5QVQ9G"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
