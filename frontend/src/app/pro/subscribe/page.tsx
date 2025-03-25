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
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const isAuthenticated = auth.getUserUID() !== null && auth.getToken() !== null;
    setAuthenticated(isAuthenticated);
    
    if (!isAuthenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
    }
  }, [auth, router]);

  const handleSubscribe = async () => {
    if (!authenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
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

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      */
     
      // Redirect to Stripe test checkout link
      window.open("https://buy.stripe.com/test_bIY5nxgiD2TyghO8ww", "_blank");
    } catch (err: any) {
      console.error("Subscription error:", err);
      /*
      setError(err.response?.data?.error || "Failed to create subscription. Please try again.");
      */
      setError("Failed to redirect to payment page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscribe-page-container">
      <div className="subscribe-card">
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
      </div>
    </div>
  );
}
