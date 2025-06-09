import { Router } from 'express';
import { SummarizationController } from '../controllers/summarization.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { SummarizationRequestSchema } from '../types';

const summarizationRouter = Router();
const summarizationController = new SummarizationController();

summarizationRouter.post(
    '/summarize',
    validateRequest(SummarizationRequestSchema),
    summarizationController.summarize
);

summarizationRouter.post(
    '/summarize/stream',
    validateRequest(SummarizationRequestSchema),
    summarizationController.summarizeAsStream
);

export default summarizationRouter;
