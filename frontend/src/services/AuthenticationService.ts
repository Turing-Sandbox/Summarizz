import axios from "axios";
import { apiURL } from "../scripts/api";

/**
 * AuthenticationService class
 *
 * @description
 * This class provides methods for user authentication, including registration,
 * login, and OAuth authentication with Google and GitHub.
 */
export class AuthenticationService {
  /**
   * register() -> Promise<{ userUID: string; token: string; refreshToken: string } | Error>
   *
   * @description
   * Registers a new user by sending a POST request to the backend
   *
   * @param firstName - The user's first name
   * @param lastName - The user's last name
   * @param username - The user's username
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to user data or Error
   */
  static async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ): Promise<{ userUID: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/register`,
        {
          firstName,
          lastName,
          username,
          email,
          password,
        },
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
          : "Failed to register user";

      return new Error(message);
    }
  }

  /**
   * login() -> Promise<{ userUID: string; token: string; refreshToken: string } | Error>
   *
   * @description
   * Logs in a user by sending a POST request to the backend
   *
   * @param email - The user's email address
   * @param password - The user's password
   * @returns Promise resolving to user data or Error
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ userUID: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/login`,
        {
          email,
          password,
        },
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
          : "Failed to login user";

      return new Error(message);
    }
  }

  /**
   * signInWithGoogle() -> Promise<{ token: string; userUID: string } | Error>
   *
   * @description
   * Initiates Google OAuth authentication
   *
   * @param useRedirect - Whether to use redirect or popup for authentication
   * @returns Promise resolving to user data or Error
   */
  static async signInWithGoogle(
    useRedirect = false
  ): Promise<{ token: string; userUID: string } | Error | null> {
    return AuthenticationService.signInWithProvider("google", useRedirect);
  }

  /**
   * signInWithGithub() -> Promise<{ token: string; userUID: string } | Error>
   *
   * @description
   * Initiates GitHub OAuth authentication
   *
   * @param useRedirect - Whether to use redirect or popup for authentication
   * @returns Promise resolving to user data or Error
   */
  static async signInWithGithub(
    useRedirect = false
  ): Promise<{ token: string; userUID: string } | Error | null> {
    return AuthenticationService.signInWithProvider("github", useRedirect);
  }

  /**
   * signInWithProvider(provider: string, useRedirect: boolean) -> Promise<{ token: string; userUID: string } | Error>
   *
   * @description
   * Initiates OAuth authentication with the specified provider
   *
   * @param provider - The OAuth provider (e.g., "google", "github")
   * @param useRedirect - Whether to use redirect or popup for authentication
   * @returns Promise resolving to user data or Error
   */
  static async signInWithProvider(
    provider: string,
    useRedirect = false
  ): Promise<{ token: string; userUID: string } | Error | null> {
    try {
      // Only proceed if we're in the browser environment
      if (typeof window === "undefined") return null;

      if (useRedirect) {
        // Get the OAuth URL from the backend
        const response = await axios.post(`${apiURL}/oauth/url`, {
          provider,
          redirectUri: `${window.location.origin}/auth/callback`,
        });

        // Redirect to the OAuth provider
        window.location.href = response.data.authUrl;
        return null;
      } else {
        // For popup flow, we need to open a new window and handle the OAuth flow
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        // Get OAuth URL for the popup
        const urlResponse = await axios.post(`${apiURL}/oauth/url`, {
          provider,
          redirectUri: `${window.location.origin}/auth/popup-callback`,
        });

        const popup = window.open(
          urlResponse.data.authUrl,
          "OAuth",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          return new Error("Popup blocked. Please allow popups for this site.");
        }

        // Listen for the popup to send the authentication result
        return new Promise((resolve, reject) => {
          window.addEventListener(
            "message",
            async (event) => {
              // Verify the origin of the message
              if (event.origin !== window.location.origin) return;

              const { token, uid, error } = event.data;

              if (error) {
                reject(new Error(error));
              } else if (token && uid) {
                resolve({ token, userUID: uid });
              }
            },
            { once: true }
          );

          // Set a timeout to reject the promise if the popup is closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              reject(new Error("Authentication was cancelled"));
            }
          }, 1000);
        });
      }
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to authenticate with provider";

      return new Error(message);
    }
  }

  /**
   * handleCallbackResult(token: string) -> Promise<{ token: string; userUID: string } | Error>
   *
   * @description
   * Handles the result of the OAuth callback by verifying the token with the backend
   *
   * @param token - The OAuth token received from the provider
   * @returns Promise resolving to user data or Error
   */
  static async handleCallbackResult(
    token: string
  ): Promise<{ token: string; userUID: string } | Error> {
    try {
      // Verify the token with our backend
      const response = await axios.post(`${apiURL}/oauth/verify`, {
        idToken: token,
        provider: "callback", // Just indicating this came from a callback
      });

      return {
        userUID: response.data.userUID,
        token: response.data.token,
      };
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to process authentication";

      return new Error(message);
    }
  }

  /**
   * logout() -> Promise<boolean | Error>
   *
   * @description
   * Logs out the user by sending a POST request to the backend
   *
   * @returns Promise resolving to true if successful, or Error
   */
  static async logout(): Promise<boolean | Error> {
    try {
      const logoutRequest = await axios.post(
        `${apiURL}/user/logout`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (logoutRequest.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to logout user";

      return new Error(message);
    }
  }

  /**
   * refreshToken() -> Promise<{ message: string; userUID: string } | Error>
   *
   * @description
   * Refreshes the user's authentication token by sending a POST request to the backend
   *
   * @returns Promise resolving to user data or Error
   */
  static async refreshToken(): Promise<
    { message: string; userUID: string } | Error
  > {
    try {
      const response = await axios.post(
        `${apiURL}/user/refresh-token`,
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
          : "Failed to refresh token";

      return new Error(message);
    }
  }

  /**
   * resetPassword() -> Promise<{ message: string } | Error>
   *
   * @description
   * Sends a password reset email to the user by sending a POST request to the backend
   *
   * @param email - The user's email address
   * @returns Promise resolving to a message or Error
   */
  static async resetPassword(
    email: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/user/reset-password`,
        { email },
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
          : "Failed to reset password";

      return new Error(message);
    }
  }
}
