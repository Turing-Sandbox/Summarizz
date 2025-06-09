import { z } from 'zod';
import { AIModel } from './models.types';

// Define the schema for the summarization request body
export const SummarizationRequestSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text must not be empty.').max(10000, 'Provided text is too long.'),
    options: z.object({
      maxLength: z.number().positive().optional(),
      format: z.enum(['concise', 'detailed']).optional(),
      model: z.nativeEnum(AIModel).optional(),
    }).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type SummarizationRequest = {
  text: string;
  options?: {
    maxLength?: number;
    format?: 'concise' | 'detailed';
    model?: AIModel;
  };
};

export interface SummarizationResponse {
  summary: string;
  metadata: {
    model: string;
    processingTime: number;
    tokenCount: number;
  };
}

export interface SummarizationStreamResponse {
  stream: string[];
  metadata: {
    model: string;
    processingTime: number;
    tokenCount: number;
  }
}

export interface SummarizationStreamChunk {
  summary: string;
  isComplete?: boolean;
  metadata?: {
    model: string;
    processingTime: number;
    tokenCount: number;
  };
}

export interface SummarizationError {
  code: string;
  message: string;
  details?: unknown;
}
