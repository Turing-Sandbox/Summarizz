export type ApiResponse<T = unknown> = {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    metadata?: {
      timestamp: string;
      path?: string;
      [key: string]: unknown;
    };
  };
  
  export const createSuccessResponse = <T>(
    data?: T,
    message?: string,
    metadata: Record<string, unknown> = {}
  ): ApiResponse<T> => ({
    status: 'success',
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
  
export const createErrorResponse = (
  message: string,
  metadata: Record<string, unknown> = {}
): ApiResponse<never> => ({
  status: 'error',
  message,
  metadata: {
    timestamp: new Date().toISOString(),
    ...metadata,
  },
});
  