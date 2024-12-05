import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://<YOUR-FIREBASE-PROJECT>.firebaseio.com",
  });
}

const adminAuth = getAuth();

export { adminAuth };
