import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new AppError(400, `Validation failed: ${JSON.stringify(validationErrors)}`, 'validation.middleware'));
      } else {
        next(error);
      }
    }
  };
};
