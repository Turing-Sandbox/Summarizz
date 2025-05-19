import axios from "axios";
import { apiURL } from "../scripts/api";
import { SubscriptionStatus } from "../models/SubscriptionStatus";

export class SubscriptionService {
  /**
   * Creates a subscription session for the user.
   *
   * @returns A promise that resolves to the response containing the session URL.
   * @returns {Promise<{url: string}>} The checkout session URL on success
   * @returns {Error} Error object with message if the request fails
   */
  static async createSubscriptionSession(): Promise<{ url: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/subscription/create-checkout-session`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return new Error(
          `Failed to create subscription session: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      return new Error("Failed to create subscription session: Unknown error");
    }
  }

  /**
   * Cancels the user's subscription.
   *
   * @returns A promise that resolves to a response containing the cancellation message and end date.
   * @returns {Promise<{message: string, willEndOn: Date}>} The cancellation message and end date on success
   * @returns {Error} Error object with message if the request fails
   */
  static async cancelSubscription(): Promise<
    | {
        message: string;
        willEndOn: Date;
      }
    | Error
  > {
    try {
      const response = await axios.post(
        `${apiURL}/subscription/cancel`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return new Error(
          `Failed to cancel subscription: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      return new Error("Failed to cancel subscription: Unknown error");
    }
  }

  /**
   * Retrieves the subscription status for the user.
   *
   * @param forceRefresh - Whether to force a refresh of the subscription status.
   * @returns A promise that resolves to the subscription status or an error.
   * @returns {Promise<SubscriptionStatus | Error>} The subscription status on success
   * @returns {Error} Error object with message if the request fails
   */
  static async getSubscriptionStatus(
    forceRefresh: boolean = false
  ): Promise<SubscriptionStatus | Error> {
    try {
      const url = forceRefresh
        ? `${apiURL}/subscription/status?forceRefresh=true&t=${new Date().getTime()}`
        : `${apiURL}/subscription/status`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return new Error(
          `Failed to get subscription status: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      return new Error("Failed to get subscription status: Unknown error");
    }
  }
}
