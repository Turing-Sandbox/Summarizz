// src/shared/config/firebase.config.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { env } from "./environment";

// Initialize Firebase
const firebaseApp = initializeApp(env.firebase);
const db = getFirestore(firebaseApp);
const realtime_db = getDatabase(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(
  firebaseApp,
  env.firebase.storageBucket || "gs://summarizz-d3713.firebasestorage.app"
);

// Conditionally initialize Analytics if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
    console.log("Firebase Analytics initialized.");
  } else {
    console.log("Firebase Analytics is not supported in this environment.");
  }
});

export { firebaseApp, analytics, db, realtime_db, auth, storage };
