import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { SubscriptionStatus } from "../../models/SubscriptionStatus";
import { SubscriptionService } from "../../services/SubscriptionService";

export default function ManageSubscription() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/authentication/login?redirect=/pro/manage");
      return;
    }

    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(
      forceRefresh
    );

    if (subscriptionStatus instanceof Error) {
      setError(subscriptionStatus.message);
    } else {
      if (subscriptionStatus.status === "canceled") {
        setCancelSuccess(false);
      }
      setSubscription(subscriptionStatus);
    }

    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!auth.isAuthenticated) {
      navigate("/authentication/login?redirect=/pro/manage");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period."
      )
    ) {
      return;
    }

    setCancelLoading(true);
    setError("");

    // Store the current subscription data before cancellation
    const currentSubscription = subscription ? { ...subscription } : null;

    const cancellationResult = await SubscriptionService.cancelSubscription();

    if (cancellationResult instanceof Error) {
      setError(cancellationResult.message);
    } else {
      // Force the subscription status to be 'canceled' immediately in the UI
      // but preserve all other data from the current subscription
      setSubscription((prev) => {
        const base = prev ?? currentSubscription;
        return base
          ? {
              ...base,
              status: "canceled",
              canceledAt: new Date().toISOString(),
            }
          : null;
      });

      setCancelSuccess(true);

      // Fetch the updated subscription status with force refresh to get the latest data from Stripe
      // Use a slightly longer delay to ensure backend has processed the change
      setTimeout(() => {
        setSubscription((s) => s ?? currentSubscription);
        fetchSubscriptionStatus(true);
      }, 1500);
    }

    setCancelLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);

    // Check if date is valid and reasonable (after 2020)
    if (isNaN(date.getTime()) || date.getTime() < 1577836800000) {
      // Jan 1, 2020
      return "Not available";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case "canceled":
        return "Canceled (access until period end)";
      case "active":
        return "Active";
      case "past_due":
        return "Past Due";
      case "free":
        return "Free";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const isStatus = (
    currentStatus: string,
    checkStatus: string,
    subscriptionObj?: SubscriptionStatus | null
  ): boolean => {
    // Special case for canceled status - check both status and canceledAt
    if (checkStatus === "canceled") {
      // A subscription is considered canceled if either the status is 'canceled' OR it has a canceledAt date
      return Boolean(
        currentStatus === "canceled" ||
          (subscriptionObj && Boolean(subscriptionObj.canceledAt))
      );
    }

    // Special case for active status - must be active AND not have canceledAt
    if (checkStatus === "active") {
      // A subscription is only considered active if the status is 'active' AND it does NOT have a canceledAt date
      return Boolean(
        currentStatus === "active" &&
          (!subscriptionObj || !subscriptionObj.canceledAt)
      );
    }

    // Default case - simple string comparison
    return Boolean(currentStatus === checkStatus);
  };

  if (loading) {
    return (
      <div className='manage-subscription-container'>
        <div className='subscription-card'>
          <h1>Loading subscription details...</h1>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.status !== "active") {
    return (
      <div className='main-content'>
        <div className='manage-subscription-container'>
          <div className='subscription-card'>
            <h1>No Active Subscription</h1>
            <p>You don't have an active Summarizz Pro subscription.</p>
            <button
              className='subscribe-button'
              onClick={() => navigate("/pro/subscribe")}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='main-content'>
      <div className='manage-subscription-container'>
        <div className='subscription-card'>
          <h1>Manage Your Subscription</h1>

          {error && <div className='error-message'>{error}</div>}
          {cancelSuccess && (
            <div className='success-message'>
              Your subscription has been canceled successfully. You'll have
              access until the end of your current billing period.
            </div>
          )}

          <div className='subscription-details'>
            <div className='detail-row'>
              <span className='detail-label'>Status:</span>
              <span className='detail-value'>
                {subscription.canceledAt
                  ? "Canceled (access until period end)"
                  : getStatusDisplay(subscription.status)}
              </span>
            </div>

            <div className='detail-row'>
              <span className='detail-label'>Plan:</span>
              <span className='detail-value'>Summarizz Pro</span>
            </div>

            <div className='detail-row'>
              <span className='detail-label'>
                {isStatus(subscription.status, "active", subscription)
                  ? "Renewal Date:"
                  : "Current Period Ends:"}
              </span>
              <span className='detail-value'>
                {subscription.periodEnd
                  ? formatDate(subscription.periodEnd)
                  : subscription.canceledAt
                  ? "End of current billing cycle"
                  : "Not applicable"}
              </span>
            </div>

            {subscription.canceledAt && (
              <div className='detail-row'>
                <span className='detail-label'>Canceled On:</span>
                <span className='detail-value'>
                  {formatDate(subscription.canceledAt)}
                </span>
              </div>
            )}
          </div>

          {!subscription.canceledAt && (
            <button
              className='cancel-button'
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Processing..." : "Cancel Subscription"}
            </button>
          )}

          <div className='subscription-info'>
            {cancelSuccess && !subscription.canceledAt && (
              <div className='success-message'>
                Your cancellation request has been processed. It will take
                effect shortly.
              </div>
            )}
            <p>
              {subscription.canceledAt
                ? "Your subscription has been canceled and will not renew. You'll have access to Pro features until the end of your current billing period."
                : "You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your current billing period."}
            </p>
          </div>

          <div className='button-container'>
            <button className='back-button' onClick={() => navigate("/")}>
              Back to Feed
            </button>
            <button
              className='refresh-button'
              onClick={() => fetchSubscriptionStatus(true)}
              title='Refresh Subscription Status'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                viewBox='0 0 16 16'
              >
                <path
                  fillRule='evenodd'
                  d='M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z'
                />
                <path d='M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z' />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
