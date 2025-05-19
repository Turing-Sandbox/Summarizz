import axios from "axios";
import { apiURL } from "../scripts/api";

export const AuthenticationService = {
  // Existing email/password authentication
  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
  ) {
    try {
      const response = await axios.post(`${apiURL}/user/register`, {
        firstName,
        lastName,
        username,
        email,
        password,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to register user";

      throw new Error(message);
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${apiURL}/user/login`, {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to login user";

      throw new Error(message);
    }
  },

  // OAuth authentication methods
  async signInWithGoogle(useRedirect = false) {
    return this.signInWithProvider("google", useRedirect);
  },

  async signInWithGithub(useRedirect = false) {
    return this.signInWithProvider("github", useRedirect);
  },

  async signInWithProvider(provider: string, useRedirect = false) {
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
          throw new Error("Popup blocked. Please allow popups for this site.");
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

      throw new Error(message);
    }
  },

  async handleCallbackResult(token: string) {
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

      throw new Error(message);
    }
  },

  async logout() {
    try {
      await axios.post(`${apiURL}/user/logout`);
      return true;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to logout user";

      throw new Error(message);
    }
  },
};
