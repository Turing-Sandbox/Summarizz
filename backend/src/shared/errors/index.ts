export class AppError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public source?: string
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class DatabaseError extends AppError {
    constructor(message: string, source?: string) {
      super(500, message, source);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string, source?: string) {
      super(404, message, source);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string, source?: string) {
      super(400, message, source);
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message: string, source?: string) {
      super(401, message, source);
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string, source?: string) {
      super(403, message, source);
    }
  }
  