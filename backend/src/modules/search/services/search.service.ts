import algoliasearch from "algoliasearch";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";
import { User } from "../../user/models/user.model";
import { db } from "../../../shared/config/firebase.config";
import { logger } from "../../../shared/utils/logger";

export class SearchService {
  private static algoliaClient: ReturnType<typeof algoliasearch> | null = null;
  private static readonly ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME as string;

  private static getAlgoliaClient() {
    if (!SearchService.algoliaClient) {
      const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID as string;
      const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY as string;

      SearchService.algoliaClient = algoliasearch(
        ALGOLIA_APP_ID,
        ALGOLIA_ADMIN_KEY
      );
    }
    return SearchService.algoliaClient;
  }

  /**
   * searchUsers(searchText: string, startingPoint:string)
   *
   * @description
   * Fetches 5 users at a time where their username matches or starts with the text provided to the search query.
   * If a starting point is provided, the search query starts from the provided starting point.
   *
   * @param searchText - The text to search for in the username.
   * @param startingPoint - The starting point for the search query.
   * @returns An array of users matching the search query.
   */
  static async searchUsers(searchText: string, startingPoint: string | null = null) {
    logger.info(`Searching for users that match the following: ${searchText}`);
    const userRef = collection(db, "users");
    const limitNumber: number = 5;

    // Build the base query
    const baseQuery = query(
      userRef,
      where("usernameLower", ">=", searchText.toLowerCase()),
      where("usernameLower", "<=", searchText.toLowerCase() + "\uf8ff"),
      orderBy("usernameLower"),
      limit(limitNumber)
    );

    // If a starting point is provided, add it to the query
    const finalQuery = startingPoint
      ? query(baseQuery, startAfter(startingPoint))
      : baseQuery;

    // Execute the query
    const results = await getDocs(finalQuery);

    const users = results.docs.map((doc) => doc.data() as User);

    // Determine the next starting point
    const nextStartingPoint =
      users.length >= limitNumber
        ? results.docs[results.docs.length - 1]?.data().usernameLower
        : null;

    logger.info(`Next starting point: ${nextStartingPoint}`);
    return { users, nextStartingPoint };
  }

  /**
   * searchContent(searchText: string, startingPoint:string)
   *
   * @description
   * Fetches 5 items at a time where their titles match or start with the text provided to the search query.
   * If a starting point is provided, the search query starts from the provided starting point.
   *
   * @param searchText - Text to search for
   * @returns - Object containing the documents and next starting point
   * @throws - Error if search fails, i.e if the search query fails
   */

  static async searchContents(searchText: string) {
    if (!searchText) {
      return { documents: [], nextStartingPoint: null };
    }

    const client = SearchService.getAlgoliaClient();
    const index = client.initIndex(this.ALGOLIA_INDEX_NAME);

    try {
      const { hits } = await index.search(searchText);

      logger.info(
        `Algolia search results length: ${hits.length}, hits: ${JSON.stringify(
          hits
        )}`
      );

      // Fetch corresponding Firebase content documents
      const firebaseContents = await Promise.all(
        hits.map(async (hit) => {
          const docRef = doc(db, "contents", hit.objectID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return {
              id: docSnap.id,
              ...docSnap.data(),
              searchRanking: hit._rankingInfo?.nbTypos ?? 0,
            };
          }
          return null;
        })
      );

      // Filter out any null values (in case some documents weren't found in Firebase)
      const contents = firebaseContents.filter(
        (content): content is NonNullable<typeof content> => content !== null
      );

      return {
        contents,
        nextStartingPoint: null, // Placeholder for future pagination logic
      };
    } catch (err) {
      logger.error(`Failed to search for contents, error: ${err}`);
      throw new Error(`Failed to search for contents, error: ${err}`);
    }
  }
}

export default SearchService;
