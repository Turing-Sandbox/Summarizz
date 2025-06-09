import { Request, Response, NextFunction } from 'express';
import { SummarizationService } from '../services/summarization.service';
import { createSuccessResponse } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';
import { SummarizationRequest } from '../types';

export class SummarizationController {
  private service: SummarizationService;

  constructor() {
    this.service = new SummarizationService();
  }

  summarize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData: SummarizationRequest = req.body;
      const result = await this.service.summarize(requestData);
      
      logger.info('Successfully generated summary', {
        textLength: requestData.text.length,
        processingTime: result.metadata.processingTime,
        model: result.metadata.model,
      });

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  };

  summarizeAsStream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData: SummarizationRequest = req.body;
      const stream = await this.service.summarizeStream(requestData);

      logger.info('Successfully generated summary stream', {
        textLength: requestData.text.length,
        processingTime: stream.metadata.processingTime,
        model: stream.metadata.model,
      });

      res.json(createSuccessResponse(stream));
    } catch (error) {
      next(error);
    }
  }
}
