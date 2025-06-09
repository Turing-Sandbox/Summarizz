import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { StringValue } from 'ms';
import { logger } from '../utils/logger';


// Possible locations for .env file
const possibleEnvPaths = [
  path.resolve(__dirname, '../../../.env'),      // dev: src/
  path.resolve(__dirname, '../../../../.env'),   // prod: dist/src/
];

// Find the first existing .env file
const envPath = possibleEnvPaths.find(fs.existsSync);

logger.info(`Using environment file (if found): ${envPath || 'none'}`);

if (!envPath) {
  throw new Error('Failed to find .env file in expected location(s).');
}

const result = dotenv.config({ path: envPath });

if (result.error) {
  throw new Error('Failed to load environment variables. Please check the .env file.');
}

export const env = {
  node: {
    env: process.env.NODE_ENV || 'development',
    port: (() => {
      const port = parseInt(process.env.PORT || '', 10);
      return isNaN(port) ? 5000 : port;
    })(),
    host: process.env.HOST || '0.0.0.0',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN as StringValue || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue || '30d',
  },
  ai: {
    geminiKey: process.env.GEMINI_API_KEY,
    googleUseVertexAI: process.env.GOOGLE_USE_VERTEX_AI === 'true',
    langchainKey: process.env.LANGCHAIN_API_KEY,
    langchainTracing: process.env.LANGCHAIN_TRACING_V3,
    openrouterKey: process.env.OPENROUTER_API_KEY,
    togetherKey: process.env.TOGETHER_API_KEY,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },
  app: {
    frontend: process.env.FRONTEND_URL,
    backend: process.env.BACKEND_URL,
    netlify: process.env.NETLIFY_URL
  }
} as const;

export type Environment = typeof env;
