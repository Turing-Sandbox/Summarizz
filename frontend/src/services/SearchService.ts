import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";
import { Content } from "../models/Content";

export class SearchService {
  /**
   * searchUsers(query: string) -> Promise<User[] | Error>
   *
   * @description
   * Searches for users based on the provided query string.
   *
   * @param query - The search query string.
   * @returns A promise that resolves to an array of User objects or an Error.
   */
  static async searchUsers(
    searchText: string,
    userStartingPoint: string | null = null
  ): Promise<{ users: User[]; nextStartingPoint: string } | Error> {
    try {
      const response = await axios.get(`${apiURL}/search/users`, {
        params: { searchText, userStartingPoint },
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to fetch user data: " + error.message);
      }
      return new Error("Failed to fetch user data: Unknown error");
    }
  }

  static async searchContents(
    searchText: string
  ): Promise<{ contents: Content[]; nextStartingPoint: string } | Error> {
    try {
      const response = await axios.get(`${apiURL}/search/contents`, {
        params: { searchText },
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error("Failed to fetch content data: " + error.message);
      }
      return new Error("Failed to fetch content data: Unknown error");
    }
  }
}
