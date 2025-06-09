import { Router } from 'express';
import { ImageGenerationController } from '../controllers/generation.controller';
import { validateRequest } from '../../../shared/middleware/validation.middleware';
import { LowerTierImageGenerationRequestSchema, HigherTierImageGenerationRequestSchema } from '../types';

const imageGenerationRouter = Router();
const imageGenerationController = new ImageGenerationController();

imageGenerationRouter.post(
    '/generate/single',
    validateRequest(LowerTierImageGenerationRequestSchema),
    imageGenerationController.generateImageSingle
);

imageGenerationRouter.post(
    '/generate/multiple',
    validateRequest(HigherTierImageGenerationRequestSchema),
    imageGenerationController.generateImageMultiple
);

export default imageGenerationRouter;
