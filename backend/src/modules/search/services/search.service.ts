import algoliasearch from "algoliasearch";
import { db } from "../../../shared/config/firebase.config";
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
import { logger } from "../../../shared/utils/logger";


export class SearchService {
  private static algoliaClient: ReturnType<typeof algoliasearch> | null = null;
  private static readonly ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;

  private static getAlgoliaClient() {
    if (!SearchService.algoliaClient) {
      const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
      const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY;
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
  static async searchUsers(searchText: string, startingPoint = null) {
    logger.info(`Searching for users that match the following: ${searchText}`);
    const userRef = collection(db, "users");
    const limitNumber: number = 5;

    // Create the base user query (no previous query)
    const userQuery = query(
      userRef,
      where("usernameLower", ">=", searchText.toLowerCase()),
      where("usernameLower", "<=", searchText.toLowerCase() + "\uf8ff"),
      orderBy("usernameLower"),
      limit(limitNumber)
    );

    /**
     * If a starting point is provided, create a new query starting at that point
     * (fetch next 5 documents starting after the starting point)
     */
    if (startingPoint) {
      logger.info(`Starting point: ${startingPoint}.`);
      logger.info("Starting point (JSON):", JSON.stringify(startingPoint, null, 3));

      const nextUserQuery = query(
        userRef,
        where("usernameLower", ">=", searchText.toLowerCase()),
        where("usernameLower", "<=", searchText.toLowerCase() + "\uf8ff"),
        orderBy("usernameLower"),
        limit(limitNumber),
        startAfter(startingPoint)
      );

      const results = await getDocs(nextUserQuery);
      const documents = results.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let nextStartingPoint = null;

      if (documents.length >= limitNumber) {
        nextStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      logger.info(`Setting starting point: ${nextStartingPoint}.`);
      return { documents, nextStartingPoint };
    } else {
      // If there's no starting point, execute base query
      logger.info("No starting point provided, starting from the beginning.");

      const results = await getDocs(userQuery);
      const documents = results.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let newStartingPoint = null;

      if (documents.length >= limitNumber) {
        newStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      logger.info(`Setting starting point: ${newStartingPoint}.`);
      return { documents, newStartingPoint };
    }
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
  static async searchContent(searchText: string) {
    try {
      if (!searchText) {
        return { documents: [], nextStartingPoint: null };
      }

      const client = this.getAlgoliaClient();
      const index = client.initIndex(this.ALGOLIA_INDEX_NAME);
      const { hits } = await index.search(searchText);

      logger.info(`Algolia search results length: ${hits.length}, hits: ${hits}`);

      // Fetch corresponding Firebase documents
      const firebaseDocuments = await Promise.all(
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
      const documents = firebaseDocuments.filter(
        (doc): doc is NonNullable<typeof doc> => doc !== null
      );

      return {
        documents,
        nextStartingPoint: null,
      };
    } catch (err) {
      logger.error(`Something went wrong, error: ${err}`);
      throw new Error(`Failed to search for content, error: ${err}`);

    }
  }
}

export default SearchService;
