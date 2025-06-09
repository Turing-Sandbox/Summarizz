import { Request, Response, NextFunction } from 'express';
import { ImageGenerationService } from '../services/generation.service';
import { createSuccessResponse } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';
import { ImageGenerationResponse } from '../types';

export class ImageGenerationController {
    private service: ImageGenerationService;

    constructor() {
        this.service = new ImageGenerationService();
    }

    generateImageSingle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            return [];
        } catch (error) {
            next(error);
        }
    };

    generateImageMultiple = async (req: Request, res: Response, next: NextFunction) => {
        try {
            return [];
        } catch (error) {
            next(error);
        }
    };
}