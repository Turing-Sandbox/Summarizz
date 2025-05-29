import express from 'express';
import rateLimit from 'express-rate-limit';
import { appConfig } from './app.config';
import { errorHandler } from './shared/middleware/error.middleware';
import { stripeWebhookMiddleware } from './shared/middleware/stripe.middleware';
import { logger } from './shared/utils/logger';
import { createErrorResponse } from './shared/utils/response';

// Import routes
import userRoutes from './modules/user/routes/user.routes';
import commentRoutes from './modules/comment/routes/comment.routes';
import contentRoutes from './modules/content/routes/content.routes';
import subscriptionRoutes from './modules/subscription/routes/subscription.routes';
import notificationRoutes from './modules/notification/routes/notification.routes';
import oauthRoutes from './modules/user/routes/oauth.routes';
import webhookRoutes from './modules/subscription/routes/webhook.routes';
import searchRoutes from './modules/search/routes/search.routes';
import summarizationRoutes from './modules/ai/routes/summarization.routes';


const app = express();

// Apply basic middleware
app.use(appConfig.middleware.cors);
app.use(appConfig.middleware.cookieParser);
app.use(appConfig.middleware.helmet);
app.use(appConfig.middleware.compression);
app.use(appConfig.middleware.json);
app.use(appConfig.middleware.urlencoded);
app.use(stripeWebhookMiddleware);

// Add request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Apply rate limiting
const limiter = rateLimit({
  ...appConfig.rateLimiting,
  handler: (req, res) => {
    res.status(429).json(
      createErrorResponse('Too many requests, please try again later')
    );
  },
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/user', userRoutes);
app.use('/comment', commentRoutes);
app.use('/content', contentRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/notification', notificationRoutes);
app.use('/oauth', oauthRoutes);
app.use('/webhook', webhookRoutes);
app.use('/search', searchRoutes);
app.use('/ai', summarizationRoutes);

app.get('/', (_, res) => {
  res.send('Server is Listening!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use(errorHandler);

export { app };
