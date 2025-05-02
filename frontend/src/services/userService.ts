import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";

/**
 * fetchUser(id: string) -> Promise<User | Error>
 *
 * @description
 * Fetches a user's information from the backend using the provided user ID
 *
 * @param id - The user ID to fetch
 * @returns Promise resolving to User object or Error
 */
export const fetchUser = async (id: string): Promise<User | Error> => {
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
};
