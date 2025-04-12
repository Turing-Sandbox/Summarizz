import { db } from '../../shared/firebaseConfig';
import { User } from '../../user-module/models/userModel';
import stripeService from './stripeService';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";

/**
 * Service for managing user subscriptions
 */
export class SubscriptionService {
  /**
   * Update a user's subscription status
   * @param uid User ID
   * @param subscriptionData Subscription data to update
   * @returns Updated user data
   */
  async updateUserSubscription(
    uid: string,
    subscriptionData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, subscriptionData);
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  /**
   * Handle subscription created event
   * @param subscriptionId Stripe subscription ID
   * @param customerId Stripe customer ID
   * @returns Updated user data
   */
  async handleSubscriptionCreated(
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeCustomerId', '==', customerId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe customer ID: ${customerId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const periodStart = new Date((subscription as any).current_period_start * 1000);
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: subscription.status as any,
        subscriptionTier: 'pro',
        stripeSubscriptionId: subscriptionId,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      });
    } catch (error) {
      console.error('Error handling subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handleSubscriptionUpdated(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const periodStart = new Date((subscription as any).current_period_start * 1000);
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: subscription.status as any,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      });
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription canceled event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const canceledAt = (subscription as any).canceled_at 
        ? new Date((subscription as any).canceled_at * 1000) 
        : new Date();
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: canceledAt,
      });
    } catch (error) {
      console.error('Error handling subscription canceled:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed event
   * @param subscriptionId Stripe subscription ID
   * @returns Updated user data
   */
  async handlePaymentFailed(subscriptionId: string): Promise<void> {
    try {
      const subscription = await stripeService.getSubscription(subscriptionId);
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error(`No user found with Stripe subscription ID: ${subscriptionId}`);
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'past_due',
        gracePeriodEnd,
      });
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  /**
   * Check and update subscription statuses that have expired
   * This should be run on a schedule (e.g., daily)
   */
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      const usersQuery = query(
        collection(db, 'users'),
        where('subscriptionTier', '==', 'pro'),
        where('subscriptionStatus', 'in', ['canceled', 'past_due'])
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        
        if (
          user.subscriptionStatus === 'canceled' && 
          user.subscriptionPeriodEnd && 
          new Date(user.subscriptionPeriodEnd as any) < now
        ) {
          await this.updateUserSubscription(doc.id, {
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled',
        });
        }
        
        if (
          user.subscriptionStatus === 'past_due' && 
          user.gracePeriodEnd && 
          new Date(user.gracePeriodEnd as any) < now
        ) {
          await this.updateUserSubscription(doc.id, {
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled',
          });
        }
      }
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();
