import { Request, Response } from 'express';
import { db } from '../../shared/firebaseConfig';
import stripeService from '../services/stripeService';
import subscriptionService from '../services/subscriptionService';
import dotenv from 'dotenv';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

dotenv.config();

/**
 * Controller for handling subscription-related requests
 */
export class SubscriptionController {
  /**
   * Create a checkout session for subscription
   * @param req Express request
   * @param res Express response
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      if (
        userData?.subscriptionStatus === 'active' && 
        userData?.subscriptionTier === 'pro'
      ) {
        res.status(400).json({ 
          error: 'User already has an active subscription',
          redirectToManage: true
        });
        return;
      }

      let customerId = userData?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          userData?.email,
          `${userData?.firstName} ${userData?.lastName}`
        );
        
        customerId = customer.id;
        
        await updateDoc(userRef, {
          stripeCustomerId: customerId
        });
      }

      // For production, create a real checkout session:
      // const session = await stripeService.createCheckoutSession(
      //   customerId,
      //   process.env.STRIPE_PROD_ID || '',
      //   `${process.env.FRONTEND_URL}/pro/success`,
      //   `${process.env.FRONTEND_URL}/pro/cancel`
      // );
      // res.status(200).json({ url: session.url });
      
      const testCheckoutUrl = "https://buy.stripe.com/test_bIY5nxgiD2TyghO8ww";
      
      res.status(200).json({ url: testCheckoutUrl });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel a subscription
   * @param req Express request
   * @param res Express response
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      if (
        !userData?.subscriptionStatus || 
        userData?.subscriptionStatus === 'canceled' ||
        !userData?.stripeSubscriptionId
      ) {
        res.status(400).json({ error: 'No active subscription found' });
        return;
      }

      const subscription = await stripeService.cancelSubscription(
        userData.stripeSubscriptionId,
        true
      );

      const canceledAt = subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000) 
        : new Date();
      
      await subscriptionService.updateUserSubscription(uid, {
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: canceledAt,
      });

      res.status(200).json({ 
        message: 'Subscription canceled successfully',
        willEndOn: new Date((subscription as any).current_period_end * 1000)
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user subscription status
   * @param req Express request
   * @param res Express response
   */
  async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      
      res.status(200).json({
        status: userData?.subscriptionStatus || 'free',
        tier: userData?.subscriptionTier || 'free',
        periodEnd: userData?.subscriptionPeriodEnd || null,
        canceledAt: userData?.subscriptionCanceledAt || null,
        gracePeriodEnd: userData?.gracePeriodEnd || null,
      });
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SubscriptionController();
