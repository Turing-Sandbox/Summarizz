import { Request, Response } from 'express';
import stripeService from '../services/stripeService';
import subscriptionService from '../services/subscriptionService';

/**
 * Controller for handling Stripe webhook events
 */
export class WebhookController {
  /**
   * Handle Stripe webhook events
   * @param req Express request
   * @param res Express response
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    console.log('Webhook received:', new Date().toISOString());
    
    const signature = req.headers['stripe-signature'] as string;
    const isTestMode = process.env.STRIPE_TEST_MODE === 'true';
    
    if (!signature && !isTestMode) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      let event;
      
      if (isTestMode && !signature) {
        console.log('Running in test mode - accepting webhook without signature verification');
        event = req.body;
      } else {
        event = stripeService.constructWebhookEvent(
          req.body,
          signature
        );
      }

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'customer.subscription.trial_will_end':
          console.log('Trial will end soon for subscription:', event.data.object.id);
          break;
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Handle subscription created event
   * @param event Stripe event
   */
  private async handleSubscriptionCreated(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionCreated(
      subscription.id,
      subscription.customer
    );
  }

  /**
   * Handle subscription updated event
   * @param event Stripe event
   */
  private async handleSubscriptionUpdated(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionUpdated(subscription.id);
  }

  /**
   * Handle subscription canceled event
   * @param event Stripe event
   */
  private async handleSubscriptionCanceled(event: any): Promise<void> {
    const subscription = event.data.object;
    await subscriptionService.handleSubscriptionCanceled(subscription.id);
  }

  /**
   * Handle payment failed event
   * @param event Stripe event
   */
  private async handlePaymentFailed(event: any): Promise<void> {
    const invoice = event.data.object;
    if (invoice.subscription) {
      await subscriptionService.handlePaymentFailed(invoice.subscription);
    }
  }

  /**
   * Handle payment succeeded event
   * @param event Stripe event
   */
  private async handlePaymentSucceeded(event: any): Promise<void> {
    const invoice = event.data.object;
    if (invoice.subscription) {
      if (invoice.billing_reason === 'subscription_create' && invoice.payment_intent) {
        try {
          const paymentIntent = await stripeService.getPaymentIntent(invoice.payment_intent);
          
          if (paymentIntent && paymentIntent.payment_method) {
            await stripeService.updateSubscriptionDefaultPaymentMethod(
              invoice.subscription,
              paymentIntent.payment_method as string
            );
            console.log(`Default payment method set for subscription: ${invoice.subscription}`);
          }
        } catch (error) {
          console.error('Error setting default payment method:', error);
        }
      }
      
      await subscriptionService.handleSubscriptionUpdated(invoice.subscription);
    }
  }
}

export default new WebhookController();
