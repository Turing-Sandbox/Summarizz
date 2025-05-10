import { Request, Response } from 'express';
import { db } from '../../../shared/config/firebase.config';
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

      // Create a real checkout session with the customer ID
      const session = await stripeService.createCheckoutSession(
        customerId,
        process.env.STRIPE_PRICE_ID || process.env.STRIPE_PROD_ID || 'price_1RDFHiR6xKT5wL0c4UXIJF92', // Use price ID from env or fallback
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/pro/subscribe?status=success`,
        `${process.env.FRONTEND_URL || 'http://localhost:3001'}/pro/subscribe?status=cancel`
      );
      
      console.log(`Created checkout session for customer: ${customerId}, session ID: ${session.id}`);
      res.status(200).json({ url: session.url });
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
      const forceRefresh = req.query.forceRefresh === 'true';
      
      console.log(`Getting subscription status for user ${uid}, forceRefresh: ${forceRefresh}`);
      
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
      
      // Get initial user data
      let userData = userDoc.data();
      
      // If forceRefresh is true and we have a subscription ID, get the latest status from Stripe
      if (forceRefresh && userData?.stripeSubscriptionId) {
        try {
          console.log(`Force refreshing subscription status for subscription ID: ${userData.stripeSubscriptionId}`);
          const subscription = await stripeService.getSubscription(userData.stripeSubscriptionId);
          
          // Update the user record with the latest status from Stripe
          if (subscription) {
            console.log(`Stripe subscription status: ${subscription.status}`);
            await updateDoc(userRef, {
              subscriptionStatus: subscription.status,
            });
            
            // Reload the user data after update
            const updatedUserDoc = await getDoc(userRef);
            if (updatedUserDoc.exists) {
              userData = updatedUserDoc.data();
            }
          }
        } catch (err) {
          console.error('Error refreshing subscription status from Stripe:', err);
          // Continue with the existing data if there's an error
        }
      }
      
      // Convert Firestore timestamps to ISO strings for proper JSON serialization
      const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return null;
        
        let date: Date | null = null;
        
        // Check if it's a Firestore timestamp
        if (timestamp && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        }
        // Check if it's a Date object
        else if (timestamp instanceof Date) {
          date = timestamp;
        }
        // If it's a number (Unix timestamp in seconds), convert to milliseconds
        else if (typeof timestamp === 'number') {
          // Ensure it's a valid timestamp (after 2020 and before 2030)
          if (timestamp > 1577836800 && timestamp < 1893456000) { // Jan 1, 2020 to Jan 1, 2030
            date = new Date(timestamp * 1000); // Convert seconds to milliseconds
          }
        }
        // If it's a string that looks like a date
        else if (typeof timestamp === 'string' && timestamp.match(/\d{4}-\d{2}-\d{2}/)) {
          const parsed = new Date(timestamp);
          if (!isNaN(parsed.getTime())) {
            date = parsed;
          }
        }
        
        // Validate the date is reasonable (after 2020)
        if (date && date.getTime() > 1577836800000) { // Jan 1, 2020
          return date.toISOString();
        }
        
        return null;
      };
      
      // If subscription is active but has no period end, calculate a reasonable end date
      // (30 days from now for monthly subscriptions)
      let periodEnd = formatTimestamp(userData?.subscriptionPeriodEnd);
      if (userData?.subscriptionStatus === 'active' && !periodEnd) {
        // If we have a created date, use that as the base, otherwise use now
        const baseDate = userData?.subscriptionCreatedAt 
          ? formatTimestamp(userData.subscriptionCreatedAt)
          : new Date().toISOString();
        
        // Calculate end date (30 days from base date)
        const endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + 30);
        periodEnd = endDate.toISOString();
        
        // Update the user record with this calculated end date
        try {
          await updateDoc(userRef, {
            subscriptionPeriodEnd: endDate
          });
          console.log(`Updated missing period end date for user ${uid}`);
        } catch (err) {
          console.error('Error updating period end date:', err);
        }
      }
      
      res.status(200).json({
        status: userData?.subscriptionStatus || 'free',
        tier: userData?.subscriptionTier || 'free',
        periodEnd,
        canceledAt: formatTimestamp(userData?.subscriptionCanceledAt),
        gracePeriodEnd: formatTimestamp(userData?.gracePeriodEnd),
      });
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SubscriptionController();
