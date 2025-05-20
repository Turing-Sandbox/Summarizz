import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

/**
 * Service for handling Stripe-related operations
 */
export class StripeService {
  /**
   * Create a Stripe customer for a user
   * @param email User's email
   * @param name User's full name
   * @returns Stripe customer object
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   * @param customerId Stripe customer ID
   * @param priceId Stripe price ID for the subscription
   * @param successUrl URL to redirect after successful payment
   * @param cancelUrl URL to redirect after canceled payment
   * @returns Checkout session
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Retrieve a subscription by ID
   * @param subscriptionId Stripe subscription ID
   * @returns Subscription object
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Stripe subscription ID
   * @param cancelAtPeriodEnd Whether to cancel at the end of the billing period
   * @returns Canceled subscription object
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Construct Stripe webhook event from payload and signature
   * @param payload Request body as string
   * @param signature Stripe signature from headers
   * @returns Stripe event
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  /**
   * Retrieve a payment intent by ID
   * @param paymentIntentId Stripe payment intent ID
   * @returns Payment intent object
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Update the default payment method for a subscription
   * @param subscriptionId Stripe subscription ID
   * @param paymentMethodId Stripe payment method ID
   * @returns Updated subscription object
   */
  async updateSubscriptionDefaultPaymentMethod(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });
      return subscription;
    } catch (error) {
      console.error('Error updating subscription payment method:', error);
      throw error;
    }
  }
}

export default new StripeService();
