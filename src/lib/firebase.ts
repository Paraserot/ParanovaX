
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBBz1RrkY2XrxW9fSmgvJsAj6ZjKGoUwXw",
  authDomain: "advocate-case-manager.firebaseapp.com",
  databaseURL: "https://advocate-case-manager-default-rtdb.firebaseio.com",
  projectId: "advocate-case-manager",
  storageBucket: "advocate-case-manager.appspot.com",
  messagingSenderId: "74290185621",
  appId: "1:74290185621:web:880b60d2b4443990a8e29c",
  measurementId: "G-89TSFHYHSQ",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((ok) => { if (ok) messaging = getMessaging(app); })
    .catch(() => { messaging = null; });
}

export { app, auth, db, storage, messaging };
