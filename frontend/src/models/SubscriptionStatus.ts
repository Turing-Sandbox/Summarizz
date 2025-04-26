export interface SubscriptionStatus {
  status: "active" | "canceled" | "past_due" | "free" | string;
  tier: string;
  periodEnd: string | null;
  canceledAt: string | null;
  gracePeriodEnd: string | null;
}
