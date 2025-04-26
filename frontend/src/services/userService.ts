import axios from "axios";
import { apiURL } from "../scripts/api";
import { User } from "../models/User";

/**
 * fetchLoggedInuser() -> void
 *
 * @description
 * Fetches the logged in user's information from the backend using the userUID
 * provided in the AuthProvider, this will set the user accordingly.
 *
 * @returns void
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
