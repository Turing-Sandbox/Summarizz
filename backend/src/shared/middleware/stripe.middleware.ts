import express, { Request, Response, NextFunction } from "express";

/**
 * Middleware to handle Stripe webhook requests differently from regular JSON requests
 * For webhook routes, we need to use the raw body for verification
 * For all other routes, we use the standard JSON parser
 */
export const stripeWebhookMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
};