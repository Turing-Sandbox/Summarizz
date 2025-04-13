import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;
      email: string;
    };
  }
}

/**
 * Middleware to authenticate JWT token
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];

  console.log('Auth Header:', authHeader);  // Debugging line

  const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

  console.log('Token:', token);  // Debugging line

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      uid: string;
      email: string;
    };

    console.log('Decoded Token:', decoded);  // Debugging line
    console.log('Decoded UID:', decoded.uid);  // Debugging line
    console.log('Decoded Email:', decoded.email);  // Debugging line

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};
