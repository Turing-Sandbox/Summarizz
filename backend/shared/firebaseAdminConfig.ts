import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const adminAuth = getAuth();

export { adminAuth };
