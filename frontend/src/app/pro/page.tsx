"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import "@/app/styles/pro.scss";
import SummarizzPro from "@/components/SummarizzPro";

export default function ProPage() {
  const router = useRouter();
  const auth = useAuth();
  const [authenticated, setAuthenticated] = useState(
    auth.getUserUID() !== null && auth.getToken() !== null
  );
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

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
      
      setHasSubscription(response.data.active);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!authenticated) {
      router.push("/authentication/login?redirect=/pro/subscribe");
      return;
    }
    router.push("/pro/subscribe");
  };
  
  const handleManageSubscription = () => {
    router.push("/pro/manage");
  };

  return (
    <div className='main-content'>
      <div className='pro-hero'>
        <SummarizzPro />
        <p className='pro-subtitle'>
          Unlock the full potential of your content
        </p>
        {loading ? (
          <button className='pro-cta-button' disabled>
            Loading...
          </button>
        ) : hasSubscription ? (
          <button className='pro-cta-button manage-button' onClick={handleManageSubscription}>
            Manage Your Subscription
          </button>
        ) : (
          <button className='pro-cta-button' onClick={handleSubscribe}>
            Get Summarizz Pro
          </button>
        )}
      </div>

      <div className='pro-features'>
        <h2 className='pro-section-header'>Why upgrade?</h2>
        <div className='features-grid'>
          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Unlimited Summaries</h3>
            <p>Create as many summaries as you need without restrictions</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Priority Processing</h3>
            <p>Your content gets processed faster than free accounts</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Advanced Analytics</h3>
            <p>Gain insights into how your content performs</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Premium Templates</h3>
            <p>Access to exclusive premium summary templates</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Ad-Free Experience</h3>
            <p>Enjoy Summarizz without any advertisements</p>
          </div>

          <div className='feature-card'>
            <div className='feature-icon'>✓</div>
            <h3>Priority Support</h3>
            <p>Get help faster with dedicated support for Pro users</p>
          </div>
        </div>
      </div>

      <div className='pro-pricing'>
        <h2 className='pro-section-header'>Simple, Transparent Pricing</h2>
        <div className='pricing-card'>
          <SummarizzPro />
          <div className='price'>
            $9.99<span>/month</span>
          </div>
          <ul className='pricing-features'>
            <li>Unlimited Summaries</li>
            <li>Priority Processing</li>
            <li>Advanced Analytics</li>
            <li>Premium Templates</li>
            <li>Ad-Free Experience</li>
            <li>Priority Support</li>
          </ul>
          {loading ? (
            <button className='pricing-button' disabled>
              Loading...
            </button>
          ) : hasSubscription ? (
            <button className='pricing-button manage-button' onClick={handleManageSubscription}>
              Manage Subscription
            </button>
          ) : (
            <button className='pricing-button' onClick={handleSubscribe}>
              Subscribe Now
            </button>
          )}
        </div>
      </div>

      <div className='pro-testimonials'>
        <h2>What Our Pro Users Say</h2>
        <div className='testimonials-container'>
          <div className='testimonial-card'>
            <p>
              "Summarizz Pro has completely transformed how I consume content.
              The unlimited summaries feature alone is worth the subscription!"
            </p>
            <div className='testimonial-author'>- Alex Johnson</div>
          </div>

          <div className='testimonial-card'>
            <p>
              "The premium templates have saved me countless hours. I can now
              create professional-looking summaries in minutes."
            </p>
            <div className='testimonial-author'>- Sarah Williams</div>
          </div>

          <div className='testimonial-card'>
            <p>
              "As a content creator, the analytics feature has been invaluable
              in understanding what resonates with my audience."
            </p>
            <div className='testimonial-author'>- Michael Chen</div>
          </div>
        </div>
      </div>

      <div className='pro-cta'>
        <h2>Ready to Upgrade Your Experience?</h2>
        <p>
          Join thousands of satisfied users who have already upgraded to
          Summarizz Pro
        </p>
        {loading ? (
          <button className='pro-cta-button' disabled>
            Loading...
          </button>
        ) : hasSubscription ? (
          <button className='pro-cta-button manage-button' onClick={handleManageSubscription}>
            Manage Your Subscription
          </button>
        ) : (
          <button className='pro-cta-button' onClick={handleSubscribe}>
            Get Started with Pro
          </button>
        )}
      </div>
    </div>
  );
}
