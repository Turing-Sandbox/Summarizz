import { db } from '../../../shared/config/firebase.config';
import { User } from '../../user/models/userModel';
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
        // Log the error but don't throw - this allows the webhook to complete successfully
        console.warn(`No user found with Stripe customer ID: ${customerId}. Storing subscription info for later association.`);
        
        // Store the subscription info in a pending subscriptions collection for later association
        const pendingSubRef = doc(db, 'pendingSubscriptions', subscriptionId);
        await setDoc(pendingSubRef, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: subscription.status,
          createdAt: new Date(),
          periodStart: new Date((subscription as any).current_period_start * 1000),
          periodEnd: new Date((subscription as any).current_period_end * 1000),
          processed: false
        });
        return;
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const periodStart = new Date((subscription as any).current_period_start * 1000);
      const periodEnd = new Date((subscription as any).current_period_end * 1000);
      
      // When a new subscription is created, clear any previous cancellation data
      await this.updateUserSubscription(uid, {
        subscriptionStatus: subscription.status as any,
        subscriptionTier: 'pro',
        stripeSubscriptionId: subscriptionId,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
        subscriptionCanceledAt: null // Clear any previous cancellation date
      });
      
      // Log the subscription creation
      console.log(`New subscription created for user ${uid}, cleared previous cancellation data`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
      // Log error but don't throw to prevent webhook failure
      // This allows Stripe to consider the webhook delivered
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
      
      // First check if this is a pending subscription
      const pendingSubRef = doc(db, 'pendingSubscriptions', subscriptionId);
      const pendingSubDoc = await getDoc(pendingSubRef);
      
      if (pendingSubDoc.exists()) {
        // Update the pending subscription data
        await updateDoc(pendingSubRef, {
          status: subscription.status,
          periodStart: new Date((subscription as any).current_period_start * 1000),
          periodEnd: new Date((subscription as any).current_period_end * 1000),
          updatedAt: new Date()
        });
        console.log(`Updated pending subscription: ${subscriptionId}`);
        return;
      }
      
      // Try to find user with this subscription ID
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        console.warn(`No user found with Stripe subscription ID: ${subscriptionId}. Storing for later association.`);
        
        // Create a pending subscription record
        await setDoc(pendingSubRef, {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status,
          createdAt: new Date(),
          periodStart: new Date((subscription as any).current_period_start * 1000),
          periodEnd: new Date((subscription as any).current_period_end * 1000),
          processed: false
        });
        return;
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
      // Log error but don't throw to prevent webhook failure
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
      
      // First check if this is a pending subscription
      const pendingSubRef = doc(db, 'pendingSubscriptions', subscriptionId);
      const pendingSubDoc = await getDoc(pendingSubRef);
      
      if (pendingSubDoc.exists()) {
        // Update the pending subscription data
        await updateDoc(pendingSubRef, {
          status: 'canceled',
          canceledAt: (subscription as any).canceled_at 
            ? new Date((subscription as any).canceled_at * 1000) 
            : new Date(),
          updatedAt: new Date()
        });
        console.log(`Updated pending subscription to canceled: ${subscriptionId}`);
        return;
      }
      
      // Try to find user with this subscription ID
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        console.warn(`No user found with Stripe subscription ID: ${subscriptionId} for cancellation. Storing for later processing.`);
        
        // Create a pending subscription record
        await setDoc(pendingSubRef, {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: 'canceled',
          createdAt: new Date(),
          canceledAt: (subscription as any).canceled_at 
            ? new Date((subscription as any).canceled_at * 1000) 
            : new Date(),
          periodEnd: new Date((subscription as any).current_period_end * 1000),
          processed: false
        });
        return;
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      const canceledAt = (subscription as any).canceled_at 
        ? new Date((subscription as any).canceled_at * 1000) 
        : new Date();
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'canceled',
        subscriptionCanceledAt: canceledAt,
      });
    } catch (error) {
      console.error('Error handling subscription canceled:', error);
      // Log error but don't throw to prevent webhook failure
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
      
      // First check if this is a pending subscription
      const pendingSubRef = doc(db, 'pendingSubscriptions', subscriptionId);
      const pendingSubDoc = await getDoc(pendingSubRef);
      
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
      
      if (pendingSubDoc.exists()) {
        // Update the pending subscription data
        await updateDoc(pendingSubRef, {
          status: 'past_due',
          gracePeriodEnd,
          updatedAt: new Date()
        });
        console.log(`Updated pending subscription to past_due: ${subscriptionId}`);
        return;
      }
      
      // Try to find user with this subscription ID
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', subscriptionId)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        console.warn(`No user found with Stripe subscription ID: ${subscriptionId} for payment failed. Storing for later processing.`);
        
        // Create a pending subscription record
        await setDoc(pendingSubRef, {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: 'past_due',
          createdAt: new Date(),
          gracePeriodEnd,
          processed: false
        });
        return;
      }
      
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      
      await this.updateUserSubscription(uid, {
        subscriptionStatus: 'past_due',
        gracePeriodEnd,
      });
    } catch (error) {
      console.error('Error handling payment failed:', error);
      // Log error but don't throw to prevent webhook failure
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
