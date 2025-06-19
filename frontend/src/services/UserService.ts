import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";

/*
 * UserService class
 *
 * @description
 * This class provides methods for user management, including fetching,
 * updating, deleting users, and managing user-related actions.
 */
export default class UserService {
  /**
   * fetchUserWithID(id: string) -> Promise<User | Error>
   *
   * @description
   * Fetches user data from the backend using the provided user ID
   *
   * @param id - The user ID to fetch
   * @returns Promise resolving to User object or Error
   */
  static async fetchUserWithID(id: string): Promise<User | Error> {
    try {
      const response = await axios.get(`${apiURL}/user/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to fetch user data: " + error.message);
      }
      return new Error("Failed to fetch user data: Unknown error");
    }
  }

  /*
   * updateUserWithID(user: User) -> Promise<{ message: string } | Error>
   *
   * @description
   * Updates user data in the backend using the provided user object
   *
   * @param user - The user object to update
   * @returns Promise resolving to a success message or Error
   */
  static async updateUserWithID(
    user: User
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.put(`${apiURL}/user/${user.uid}`, user);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to update user data: " + error.message);
      }
      return new Error("Failed to update user data: Unknown error");
    }
  }

  /*
   * deleteUserWithID(id: string, email: string, password: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Deletes a user account from the backend using the provided user ID
   *
   * @param id - The user ID to delete
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to a success message or Error
   */
  static async deleteUserWithID(
    id: string,
    email: string,
    password: string
  ): Promise<{ message: string } | Error> {
    try {
      // Send a request to the backend to delete the account
      const response = await axios.delete(`${apiURL}/user/${id}`, {
        data: {
          email,
          password,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to delete user data: " + error.message);
      }
      return new Error("Failed to delete user data: Unknown error");
    }
  }

  /*
   * uploadProfileImage(profileImage: File, oldProfileImage: string) -> Promise<{ url: string } | Error>
   *
   * @description
   * Uploads a new profile image for the user
   *
   * @param profileImage - The new profile image file
   * @param oldProfileImage - The URL of the old profile image
   * @returns Promise resolving to the new image URL or Error
   */
  static async uploadProfileImage(
    profileImage: File,
    oldProfileImage: string
  ): Promise<{ url: string } | Error> {
    try {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("oldProfileImage", oldProfileImage);

      const response = await axios.post(
        `${apiURL}/user/upload-profile-image`,
        formData
      );

      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        return new Error("Failed to upload profile image");
      }
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to upload profile image: " + error.message);
      }
      return new Error("Failed to upload profile image: Unknown error");
    }
  }

  /*
   * changePassword(userId: string, oldPassword: string, newPassword: string, confirmPassword: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Changes the password of a user account
   *
   * @param userId - The ID of the user
   * @param oldPassword - The user's old password
   * @param newPassword - The user's new password
   * @param confirmPassword - The confirmation of the new password
   * @returns Promise resolving to a success message or Error
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string } | Error> {
    // Validate input
    const validationError = await UserService.validatePassword(
      oldPassword,
      newPassword,
      confirmPassword
    );
    if (validationError) {
      return new Error(validationError);
    }

    // Upload new password
    try {
      const response = await axios.post(
        `${apiURL}/user/${userId}/change-password`,
        {
          userId,
          oldPassword,
          newPassword,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to change password: " + error.message);
      }
      return new Error("Failed to change password: Unknown error");
    }
  }

  /*
   * validatePassword(oldPassword: string, newPassword: string, confirmPassword: string, requireOldPassword: boolean) -> Promise<string | null>
   *
   * @description
   * Validates the new password and its confirmation
   *
   * @param oldPassword - The user's old password
   * @param newPassword - The user's new password
   * @param confirmPassword - The confirmation of the new password
   * @param requireOldPassword - Whether to require the old password for validation
   * @returns Promise resolving to a validation message or null if valid
   */
  static async validatePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
    requireOldPassword: boolean = true
  ): Promise<string | null> {
    // Validation
    if (requireOldPassword && !oldPassword) {
      return "Please provide your current password.";
    }

    if (!newPassword || !confirmPassword) {
      return "Please provide a new password.";
    }

    if (newPassword !== confirmPassword) {
      return "New passwords do not match.";
    }

    if (newPassword.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (requireOldPassword && newPassword === oldPassword) {
      return "New password cannot be the same as the current password.";
    }

    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return "Password must contain at least one number, one lowercase and one uppercase letter.";
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return "Password must contain at least one special character.";
    }

    return null;
  }

  /*
   * changeEmail(userId: string, newEmail: string, currentPassword: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Changes the email address of a user account
   *
   * @param userId - The ID of the user
   * @param newEmail - The new email address
   * @param currentPassword - The user's current password
   * @returns Promise resolving to a success message or Error
   */
  static async changeEmail(
    userId: string,
    newEmail: string,
    currentPassword: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/${userId}/change-email`,
        {
          currentPassword,
          newEmail,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to change email: " + error.message);
      }
      return new Error("Failed to change email: Unknown error");
    }
  }

  /*
   * changeUsername(userId: string, newUsername: string) -> Promise<{ message: string } | Error>
   *
   * @description
   * Changes the username of a user account
   *
   * @param userId - The ID of the user
   * @param newUsername - The new username
   * @returns Promise resolving to a success message or Error
   */
  static async changeUsername(
    userId: string,
    newUsername: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/${userId}/change-username`,
        {
          newUsername,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to change username: " + error.message);
      }
      return new Error("Failed to change username: Unknown error");
    }
  }

  /*
   * getRelatedContentCreators(userId: string) -> Promise<User[] | Error>
   *
   * @description
   * Fetches related content creators for a given user ID
   *
   * @param userId - The ID of the user
   * @returns Promise resolving to an array of User objects or Error
   */
  static async getRelatedContentCreators(
    userId: string
  ): Promise<User[] | Error> {
    try {
      const response = await axios.get(
        `${apiURL}/user/${userId}/related-content-creators`
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error(
          "Failed to fetch related content creators: " + error.message
        );
      }
      return new Error(
        "Failed to fetch related content creators: Unknown error"
      );
    }
  }
}
