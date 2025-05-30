import { Router } from 'express';
import { SummarizationController } from '../controllers/summarization.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { SummarizationRequestSchema } from '../types';

const router = Router();
const summarizationController = new SummarizationController();

router.post(
  '/summarize',
  validateRequest(SummarizationRequestSchema),
  summarizationController.summarize
);

export default router;
