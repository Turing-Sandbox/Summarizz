export interface User {
  uid: string; // Firebase UID
  firstName: string; // User’s first name
  lastName: string; // User’s last name
  email: string; // User’s email
  username: string; // Display name
  createdAt: Date; // Timestamp
  profileImage?: string; // Optional profile image
  bio?: string; // Optional bio
  phone?: string; // Optional phone number
  dateOfBirth?: string; // Optional date of birth
  location?: string; // Optional location
  website?: string; // Optional website
  content?: string[]; // Optional content
  likedContent?: string[]; // Optional liked content
  bookmarkedContent?: string[]; // Optional bookmarked content
  following?: string[]; // Optional followed creators
  followers?: string[]; // Optional followed by users
  sharedContent?: string[]; // Optional shared content
  isPrivate?: boolean; // Optional private account
  usernameLower?: string; // Field for lowercase username, used for search queries.
  followRequests?: string[]; // Optional follow requests
  
  // Subscription related fields
  subscriptionStatus?: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired'; // User's subscription status
  subscriptionTier?: 'free' | 'pro'; // User's subscription tier
  stripeCustomerId?: string; // Stripe customer ID
  stripeSubscriptionId?: string; // Stripe subscription ID
  subscriptionPeriodEnd?: Date; // When the current subscription period ends
  subscriptionPeriodStart?: Date; // When the current subscription period started
  subscriptionCanceledAt?: Date; // When the subscription was canceled (if applicable)
  gracePeriodEnd?: Date; // End of grace period for failed payments (if applicable)
}
