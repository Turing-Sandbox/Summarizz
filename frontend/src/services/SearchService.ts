import axios from "axios";
import { apiURL } from "../scripts/api";
import { SearchResponse } from "../models/SearchResult";

export class SearchService {
  /**
   * search(searchText: string, searchType: string, limit: number, offset: number) -> Promise<SearchResponse | Error>
   *
   * @description
   * Searches for users and/or content based on the provided parameters.
   *
   * @param searchText - The search query string.
   * @param searchType - The type of search to perform (users, content, or all).
   * @param limit - The maximum number of results to return.
   * @param offset - The offset for pagination.
   * @returns A promise that resolves to a SearchResponse object or an Error.
   */
  static async search(
    searchText: string,
    searchType: "users" | "content" | "all" = "all",
    limit: number = 5,
    offset: number = 0
  ): Promise<SearchResponse | Error> {
    try {
      const response = await axios.get(`${apiURL}/search`, {
        params: { searchText, searchType, limit, offset },
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new Error(`Failed to fetch search data: ${error.message}`);
      }
      return new Error("Failed to fetch search data: Unknown error");
    }
  }
}
