import algoliasearch from "algoliasearch";
import { db } from "../../shared/firebaseConfig";
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
   */
  static async searchUsers(searchText: string, startingPoint = null) {
    console.log("Searching... (from service)");
    console.log("Searching for specific users...");
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

    // If there's a starting point, create a new query starting at that point
    // (fetch next 5 documents starting after the starting point)
    if (startingPoint) {
      console.log("starting point");
      console.log(JSON.stringify(startingPoint, null, 3));
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
        // const nextStartingPoint = results.docs[results.docs.length - 1]?.data().uid;
        nextStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      console.log("setting starting point: ", nextStartingPoint);
      return { documents, nextStartingPoint };
    } else {
      // If there's no starting point, execute the base query
      console.log("no starting point");
      const results = await getDocs(userQuery);
      const documents = results.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let newStartingPoint = null;

      if (documents.length >= limitNumber) {
        // newStartingPoint = results.docs[results.docs.length - 1]?.data().uid;
        newStartingPoint =
          results.docs[results.docs.length - 1]?.data().usernameLower;
      }

      console.log("setting starting point: ", newStartingPoint);
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
   */
  static async searchContent(searchText: string) {
    try {
      if (!searchText) {
        console.log("No search text provided");
        return { documents: [], nextStartingPoint: null };
      }

      const client = this.getAlgoliaClient();
      const index = client.initIndex(this.ALGOLIA_INDEX_NAME);
      const { hits } = await index.search(searchText);

      console.log("Algolia search results: ", hits);

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
      console.error("Algolia search error: ", err);
      throw new Error("Failed to search for content");
    }
  }
}

export default SearchService;
