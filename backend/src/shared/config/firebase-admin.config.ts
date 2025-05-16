import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';
import { env } from './environment';

let adminAuth: admin.auth.Auth;

try {
  // Check if Firebase Admin is already initialized
  if (!admin.apps.length) {
    // const projectId = process.env.FIREBASE_PROJECT_ID;
    // const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    // if (!projectId || !clientEmail || !privateKey) {
    //   throw new Error('Missing Firebase Admin configuration. Required environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    // }

    logger.info('Initializing Firebase Admin with service account');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: env.firebase.databaseURL,
    });
    logger.info('Firebase Admin initialized successfully');
  }

  adminAuth = admin.auth();
} catch (error) {
  logger.error('Error initializing Firebase Admin:', error);
  throw error;
}

export { adminAuth };