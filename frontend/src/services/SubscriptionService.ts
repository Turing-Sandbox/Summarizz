import axios, { AxiosResponse } from "axios";
import { apiURL } from "../scripts/api";
import { SubscriptionStatus } from "../models/SubscriptionStatus";

export class SubscriptionService {
  /**
   * Creates a subscription session for the user.
   *
   * @param user - The user object for whom the subscription session is created.
   * @returns A promise that resolves to the response containing the session URL.
   * @throws An error if the request fails.
   */
  static async createSubscriptionSession(): Promise<
    AxiosResponse<{ url: string }>
  > {
    try {
      const response = await axios.post(
        `${apiURL}/subscription/create-checkout-session`,
        {},
        {
          withCredentials: true,
        }
      );

      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to create subscription session: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw new Error("Failed to create subscription session: Unknown error");
    }
  }

  static async cancelSubscription(): Promise<
    AxiosResponse<{ message: string; willEndOn: Date }>
  > {
    try {
      const response = await axios.post(
        `${apiURL}/subscription/cancel`,
        {},
        {
          withCredentials: true,
        }
      );

      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to cancel subscription: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw new Error("Failed to cancel subscription: Unknown error");
    }
  }

  // GET
  static async getSubscriptionStatus(
    forceRefresh: boolean = false
  ): Promise<AxiosResponse<SubscriptionStatus>> {
    try {
      const url = forceRefresh
        ? `${apiURL}/subscription/status?forceRefresh=true&t=${new Date().getTime()}`
        : `${apiURL}/subscription/status`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get subscription status: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw new Error("Failed to get subscription status: Unknown error");
    }
  }
}
