import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";

export default class UserService {
  /**
   * fetchUser(id: string) -> Promise<User | Error>
   *
   * @description
   * Fetches a user's information from the backend using the provided user ID
   *
   * @param id - The user ID to fetch
   * @returns Promise resolving to User object or Error
   */
  static async fetchUserWithID(id: string): Promise<User | Error> {
    if (!id) {
      return new Error("User ID is required");
    }

    try {
      const res = await axios.get(`${apiURL}/user/${id}`);
      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to fetch user data: " + error.message);
      }
      return new Error("Failed to fetch user data: Unknown error");
    }
  }

  /**
   * fetchUserByUsername(username: string) -> Promise<User | Error>
   *
   * @description
   * Fetches a user's information from the backend using the provided username
   *
   * @param username - The username to fetch
   * @returns Promise resolving to User object or Error
   */
  static async updateUserWithID(user: User): Promise<User | Error> {
    if (!user.uid) {
      return new Error("User ID is required");
    }

    try {
      const res = await axios.put(`${apiURL}/user/${user.uid}`, user);
      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to update user data: " + error.message);
      }
      return new Error("Failed to update user data: Unknown error");
    }
  }

  /**
   * deleteUserWithID(id: string) -> Promise<void | Error>
   *
   * @description
   * Deletes a user from the backend using the provided user ID
   *
   * @param id - The user ID to delete
   * @returns Promise resolving to void or Error
   */
  static async deleteUserWithID(
    id: string,
    email: string,
    password: string
  ): Promise<string | Error> {
    if (!id) {
      return new Error("User ID is required");
    }

    try {
      // Send a request to the backend to delete the account
      const res = await axios.delete(`${apiURL}/user/${id}`, {
        data: {
          email,
          password,
        },
      });

      return res.data.message;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to delete user data: " + error.message);
      }
      return new Error("Failed to delete user data: Unknown error");
    }
  }
}

// router.post("/upload-profile-image", uploadProfileImageController); // Upload Profile Image

// // Profile View - Follow/Unfollow User
// router.post("/:userId/follow/:targetId", followUserController); // Follow User
// router.post("/:userId/unfollow/:targetId", unfollowUserController); // Unfollow User

// // Profile View - Request Follow for Private Account
// router.post("/:userId/request/:targetId", requestFollowController); // Request Follow
// // Approve and Reject Follow Requests
// router.post("/:userId/approve/:requesterId", approveFollowRequestController); // Approve Follow Request
// router.post("/:userId/reject/:requesterId", rejectFollowRequestController); // Reject Follow Request

// // Profile Management - Change Password
// router.post("/:userId/change-password", changePasswordController); // Change Password

// // Profile Management - Change Email/Username
// router.post("/:userId/change-email", changeEmailController);
// router.post("/:userId/change-username", changeUsernameController);
