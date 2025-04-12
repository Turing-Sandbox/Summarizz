"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/manage-subscription.scss";

interface SubscriptionStatus {
  active: boolean;
  tier: string;
  periodEnd: string;
  canceledAt: string | null;
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  useEffect(() => {
    const isAuthenticated = auth.getUserUID() !== null && auth.getToken() !== null;
    
    if (!isAuthenticated) {
      router.push("/authentication/login?redirect=/pro/manage");
      return;
    }
    
    fetchSubscriptionStatus();
  }, [auth, router]);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    setError("");
    
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
      
      setSubscription(response.data);
    } catch (err: any) {
      console.error("Failed to fetch subscription status:", err);
      setError(err.response?.data?.error || "Failed to load subscription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.")) {
      return;
    }
    
    setCancelLoading(true);
    setError("");
    
    try {
      const token = auth.getToken();
      const response = await axios.post(
        `${apiURL}/subscription/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setCancelSuccess(true);
      // Refresh subscription status
      setSubscription({
        ...subscription!,
        canceledAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Failed to cancel subscription:", err);
      setError(err.response?.data?.error || "Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="manage-subscription-container">
        <div className="subscription-card">
          <h1>Loading subscription details...</h1>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.active) {
    return (
      <div className="manage-subscription-container">
        <div className="subscription-card">
          <h1>No Active Subscription</h1>
          <p>You don't have an active Summarizz Pro subscription.</p>
          <button 
            className="subscribe-button" 
            onClick={() => router.push("/pro/subscribe")}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-subscription-container">
      <div className="subscription-card">
        <h1>Manage Your Subscription</h1>
        
        {error && <div className="error-message">{error}</div>}
        {cancelSuccess && <div className="success-message">Your subscription has been canceled successfully. You'll have access until the end of your current billing period.</div>}
        
        <div className="subscription-details">
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">
              {subscription.canceledAt ? "Canceled (access until period end)" : "Active"}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">Summarizz Pro</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Current Period Ends:</span>
            <span className="detail-value">{formatDate(subscription.periodEnd)}</span>
          </div>
          
          {subscription.canceledAt && (
            <div className="detail-row">
              <span className="detail-label">Canceled On:</span>
              <span className="detail-value">{formatDate(subscription.canceledAt)}</span>
            </div>
          )}
        </div>
        
        {!subscription.canceledAt && (
          <button 
            className="cancel-button" 
            onClick={handleCancelSubscription}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Processing..." : "Cancel Subscription"}
          </button>
        )}
        
        <div className="subscription-info">
          <p>
            {subscription.canceledAt 
              ? "Your subscription has been canceled and will not renew. You'll have access to Pro features until the end of your current billing period."
              : "You can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your current billing period."}
          </p>
        </div>
        
        <button 
          className="back-button" 
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
