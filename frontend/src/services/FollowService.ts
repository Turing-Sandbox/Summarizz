import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";

/*
 * FollowService class
 *
 * @description
 * This class provides methods to follow, unfollow, and manage follow requests between users.
 */
export default class FollowService {
  /*
   * followUser(userID: string, userToFollowID: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Follows a user by sending a POST request to the backend
   *
   * @param userID - The ID of the user who wants to follow
   * @param userToFollowID - The ID of the user to be followed
   * @returns Promise resolving to a message or Error
   */
  static async followUser(
    userID: string,
    userToFollowID: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/${userID}/follow/${userToFollowID}`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to follow user";

      return new Error(message);
    }
  }

  /*
   * unfollowUser(userID: string, userToUnfollowID: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Unfollows a user by sending a DELETE request to the backend
   *
   * @param userID - The ID of the user who wants to unfollow
   * @param userToUnfollowID - The ID of the user to be unfollowed
   * @returns Promise resolving to a message or Error
   */
  static async unfollowUser(
    userID: string,
    userToUnfollowID: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.delete(
        `${apiURL}/user/${userID}/unfollow/${userToUnfollowID}`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to unfollow user";

      return new Error(message);
    }
  }

  /*
   * getFollowers(userID: string) -> Promise<{ followers: User[] } | Error>
   *
   * @description
   * Retrieves the followers of a user by sending a GET request to the backend
   *
   * @param userID - The ID of the user whose followers are to be retrieved
   * @returns Promise resolving to an array of followers or Error
   */
  static async getFollowers(
    userID: string
  ): Promise<{ followers: User[] } | Error> {
    try {
      const response = await axios.get(`${apiURL}/user/${userID}/followers`, {
        withCredentials: true,
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get followers";

      return new Error(message);
    }
  }

  /*
   * getFollowing(userID: string) -> Promise<{ following: User[] } | Error>
   *
   * @description
   * Retrieves the users that a user is following by sending a GET request to the backend
   *
   * @param userID - The ID of the user whose following list is to be retrieved
   * @returns Promise resolving to an array of users being followed or Error
   */
  static async getFollowing(
    userID: string
  ): Promise<{ following: User[] } | Error> {
    try {
      const response = await axios.get(`${apiURL}/user/${userID}/following`, {
        withCredentials: true,
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get following";

      return new Error(message);
    }
  }

  /*
   * getFollowRequests(userID: string) -> Promise<{ requests: User[] } | Error>
   *
   * @description
   * Retrieves the follow requests received by a user by sending a GET request to the backend
   *
   * @param userID - The ID of the user whose follow requests are to be retrieved
   * @returns Promise resolving to an array of follow requests or Error
   */
  static async getFollowRequests(
    userID: string
  ): Promise<{ users: User[] } | Error> {
    try {
      const response = await axios.get(
        `${apiURL}/user/${userID}/follow-requests`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get follow requests";
      return new Error(message);
    }
  }

  /*
   * approveFollowRequest(userID: string, requesterID: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Approves a follow request from a user by sending a POST request to the backend
   *
   * @param userID - The ID of the user who is approving the follow request
   * @param requesterID - The ID of the user whose follow request is being approved
   * @returns Promise resolving to a message or Error
   */
  static async approveFollowRequest(
    userID: string,
    requesterID: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/${userID}/approve/${requesterID}`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to approve follow request";

      return new Error(message);
    }
  }

  /*
   * rejectFollowRequest(userID: string, requesterID: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Rejects a follow request from a user by sending a POST request to the backend
   *
   * @param userID - The ID of the user who is rejecting the follow request
   * @param requesterID - The ID of the user whose follow request is being rejected
   * @returns Promise resolving to a message or Error
   */
  static async rejectFollowRequest(
    userID: string,
    requesterID: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/${userID}/reject/${requesterID}`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to reject follow request";

      return new Error(message);
    }
  }
}
