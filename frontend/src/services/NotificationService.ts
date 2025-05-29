import axios from "axios";
import { apiURL } from "../scripts/api";
import { Notification } from "../models/Notification";

/**
 * NotificationService class
 *
 * @description
 * This class provides methods for managing notifications, including fetching,
 * marking as read, and pushing new notifications.
 */
export default class NotificationService {
  /**
   * getNotifications() -> Promise<Notification[] | Error>
   *
   * @description
   * Fetches all notifications for a given user.
   *
   * @param userId - The user's ID
   * @returns Promise resolving to an array of notifications or Error
   */
  static async getNotifications(
    userId: string
  ): Promise<Notification[] | Error> {
    try {
      const response = await axios.get<Notification[]>(
        `${apiURL}/notification/${userId}`,
        { withCredentials: true }
      );

      console.log(
        `NotificationService.getNotifications() -> 
          ${response.data}
        `
      );
      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to fetch notifications";

      return new Error(message);
    }
  }

  /**
   * getUnreadNotifications() -> Promise<Notification[] | Error>
   *
   * @description
   * Fetches unread notifications for a given user.
   *
   * @param userId - The user's ID
   * @returns Promise resolving to an array of unread notifications or Error
   */
  static async getUnreadNotifications(
    userId: string
  ): Promise<Notification[] | Error> {
    try {
      const response = await axios.get<Notification[]>(
        `${apiURL}/notification/unread/${userId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to fetch new notifications";

      return new Error(message);
    }
  }

  /**
   * markAsRead() -> Promise<void | Error>
   *
   * @description
   * Marks a notification as read for a given user.
   *
   * @param userId - The user's ID
   * @param notificationId - The notification ID
   * @returns Promise resolving to void or Error
   */
  static async markAsRead(
    userId: string,
  ): Promise<void | Error> {
    try {
      await axios.post(`${apiURL}/notification/${userId}/read`);
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to mark notifications as read";

      return new Error(message);
    }
  }
}
