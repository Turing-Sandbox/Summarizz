import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { logger } from "./loggingHandler";

dotenv.config();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize firebase, db, realtime_db, auth, storage
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const realtime_db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(
  firebaseApp,
  "gs://summarizz-d3713.firebasestorage.app"
);

// Conditionally initialize analytics if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
    logger.info("Firebase Analytics initialized.");

  } else {
    logger.info("Firebase Analytics is not supported in this environment.");

  }
});

export { firebaseApp, analytics, db, realtime_db, auth, storage };
