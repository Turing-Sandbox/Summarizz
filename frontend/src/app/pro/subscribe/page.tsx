"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/subscribe.scss";

export default function SubscribePage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const isAuthenticated = auth.getUserUID() !== null && auth.getToken() !== null;
    setAuthenticated(isAuthenticated);
    
    if (!isAuthenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    // Check for status parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      setSuccess(true);
      // Clear the URL parameter without refreshing the page
      window.history.replaceState({}, document.title, '/pro/subscribe');
      // Check subscription status after a successful payment
      checkSubscriptionStatus();
    } else if (status === 'cancel') {
      setCanceled(true);
      // Clear the URL parameter without refreshing the page
      window.history.replaceState({}, document.title, '/pro/subscribe');
    }
  }, [auth, router]);

  // Function to check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const token = auth.getToken();
      const response = await axios.get(
        `${apiURL}/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // If subscription is active, redirect to feed
      if (response.data.status === 'active' && response.data.tier === 'pro') {
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!authenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = auth.getToken();
      const response = await axios.post(
        `${apiURL}/subscription/create-checkout-session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Open Stripe Checkout in a new tab
      window.location.href = response.data.url;
    } catch (err: any) {
      console.error("Subscription error:", err);
      setError(err.response?.data?.error || "Failed to create subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscribe-page-container">
      <div className="subscribe-card">
        {success ? (
          <>
            <h1>Subscription Successful!</h1>
            <p className="subscribe-description">
              Thank you for subscribing to Summarizz Pro! Your account has been upgraded.
            </p>
            <div className="success-message">
              <p>You now have access to all premium features.</p>
              <p>You will be redirected to your feed shortly...</p>
            </div>
          </>
        ) : canceled ? (
          <>
            <h1>Subscription Canceled</h1>
            <p className="subscribe-description">
              You have canceled the subscription process. No charges have been made.
            </p>
            <p>You can subscribe anytime when you're ready.</p>
            <button 
              className="subscribe-button" 
              onClick={handleSubscribe}
              disabled={loading || !authenticated}
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <h1>Subscribe to Summarizz Pro</h1>
            <p className="subscribe-description">
              You're just one step away from unlocking all the premium features of Summarizz Pro.
            </p>

            <div className="subscription-details">
              <div className="subscription-plan">
                <h2>Monthly Plan</h2>
                <div className="subscription-price">$9.99<span>/month</span></div>
                <ul className="subscription-features">
                  <li>Unlimited Summaries</li>
                  <li>Priority Processing</li>
                  <li>Advanced Analytics</li>
                  <li>Premium Templates</li>
                  <li>Ad-Free Experience</li>
                  <li>Priority Support</li>
                </ul>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              className="subscribe-button" 
              onClick={handleSubscribe}
              disabled={loading || !authenticated}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </button>

            <div className="payment-info">
              <p>Secure payment processing by Stripe</p>
              <p className="payment-disclaimer">
                You can cancel your subscription at any time from your account settings.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
