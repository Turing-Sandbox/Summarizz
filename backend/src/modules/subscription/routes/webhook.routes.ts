import express from 'express';
import webhookController from '../controllers/webhook.controller';

const router = express.Router();

// Raw body needed for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookController.handleWebhook.bind(webhookController)
);

export default router;
