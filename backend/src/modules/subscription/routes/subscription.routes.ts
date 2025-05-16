import express from 'express';
import subscriptionController from '../controllers/subscription.controller';
import { authenticateToken } from '../../../shared/middleware/auth';

const router = express.Router();

router.post(
  '/create-checkout-session',
  authenticateToken,
  subscriptionController.createCheckoutSession.bind(subscriptionController)
);

router.post(
  '/cancel',
  authenticateToken,
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

router.get(
  '/status',
  authenticateToken,
  subscriptionController.getSubscriptionStatus.bind(subscriptionController)
);

export default router;
