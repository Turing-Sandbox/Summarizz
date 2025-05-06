import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import { SubscriptionService } from "../../services/SubscriptionService";

export default function SubscribePro() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    // Check for status parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");

    if (status === "success") {
      setSuccess(true);
      // Clear the URL parameter without refreshing the page
      window.history.replaceState({}, document.title, "/pro/subscribe");
      // Check subscription status after a successful payment
      checkSubscriptionStatus();
    } else if (status === "cancel") {
      setCanceled(true);
      // Clear the URL parameter without refreshing the page
      window.history.replaceState({}, document.title, "/pro/subscribe");
    }
  }, []);

  // Function to check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const response = await SubscriptionService.getSubscriptionStatus();

      // If subscription is active, redirect to feed
      if (response.data.status === "active" && response.data.tier === "pro") {
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (err) {
      console.error("Error checking subscription status:", err);
    }
  };

  const handleSubscribe = async () => {
    if (!auth.isAuthenticated) {
      navigate("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await SubscriptionService.createSubscriptionSession();

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to create subscription. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='subscribe-page-container'>
      <div className='subscribe-card'>
        {success ? (
          <>
            <h1>Subscription Successful!</h1>
            <p className='subscribe-description'>
              Thank you for subscribing to Summarizz Pro! Your account has been
              upgraded.
            </p>
            <div className='success-message'>
              <p>You now have access to all premium features.</p>
              <p>You will be redirected to your feed shortly...</p>
            </div>
          </>
        ) : canceled ? (
          <>
            <h1>Subscription Canceled</h1>
            <p className='subscribe-description'>
              You have canceled the subscription process. No charges have been
              made.
            </p>
            <p>You can subscribe anytime when you're ready.</p>
            <button
              className='subscribe-button'
              onClick={handleSubscribe}
              disabled={loading || !auth.isAuthenticated}
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <h1>Subscribe to Summarizz Pro</h1>
            <p className='subscribe-description'>
              You're just one step away from unlocking all the premium features
              of Summarizz Pro.
            </p>

            <div className='subscription-details'>
              <div className='subscription-plan'>
                <h2>Monthly Plan</h2>
                <div className='subscription-price'>
                  $9.99<span>/month</span>
                </div>
                <ul className='subscription-features'>
                  <li>Unlimited Summaries</li>
                  <li>Priority Processing</li>
                  <li>Advanced Analytics</li>
                  <li>Premium Templates</li>
                  <li>Ad-Free Experience</li>
                  <li>Priority Support</li>
                </ul>
              </div>
            </div>

            {error && <div className='error-message'>{error}</div>}

            <button
              className='subscribe-button'
              onClick={handleSubscribe}
              disabled={loading || !auth.isAuthenticated}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </button>

            <div className='payment-info'>
              <p>Secure payment processing by Stripe</p>
              <p className='payment-disclaimer'>
                You can cancel your subscription at any time from your account
                settings.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
