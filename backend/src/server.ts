import { app } from './app';
import { env } from './shared/config/environment';
import { logger } from './shared/utils/logger';

const startServer = () => {
  try {
    // Handle uncaught exceptions - register early
    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION: Shutting down...', err);
      process.exit(1);
    });

    const server = app.listen(env.node.port, () => {
      logger.info(`Server running in ${env.node.env} mode on port ${env.node.port}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION: Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION: Shutting down...', err);
      process.exit(1);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
