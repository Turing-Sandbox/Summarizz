import { logger } from "../../../shared/utils/logger";
import { SearchResponse, searchType, User, Content } from "../types";
import * as searchRepository from '../repository/search.repository';


export class SearchService {

  /**
   * search(searchText: string, searchType: searchType, limit: number, offset: number)
   *
   * @description
   * Searches for users and/or content by calling the data repository.
   * It orchestrates calls for different search types.
   *
   * @param searchText - The text to search for.
   * @param searchType - The type of search to perform (users, content, or all).
   * @param limit - The maximum number of results to return per type.
   * @param offset - The starting point of the search (used for pagination).
   */
  static async search(
    searchText: string,
    searchType: searchType = "all",
    limit: number = 5,
    offset: number = 0,
  ): Promise<SearchResponse> {
    try {
      const promises = [];

      // Add promises to the array based on the searchType,
      if (searchType === 'users' || searchType === 'all') {
        promises.push(searchRepository.findUsers(searchText, limit, offset));
      } else {
        promises.push(Promise.resolve([])); // Add empty promise to maintain structure
      }

      if (searchType === 'content' || searchType === 'all') {
        promises.push(searchRepository.findContent(searchText, limit, offset));
      } else {
        promises.push(Promise.resolve([])); // Add empty promise to maintain structure
      }

      // Execute all database queries in parallel for efficiency
      const [users, content] = await Promise.all(promises) as [User[], Content[]];

      return {
        users,
        content,
      };

    } catch (error) {
      logger.error(`Error in SearchService for ${searchType}: ${error}`);
      // Re-throw the error to be caught by a global error handler or the controller
      throw error;
    }
  }
}

export default SearchService;
