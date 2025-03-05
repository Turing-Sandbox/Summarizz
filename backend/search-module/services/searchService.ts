import { db } from "../../shared/firebaseConfig";
import { collection, query, getDocs, where, startAt, endAt, orderBy, limit, startAfter } from "firebase/firestore";

export class SearchService {
	static async searchUsers(searchText: string, startingPoint = null) {
		console.log("Searching... (from service)")
		console.log("Searching for specific users...")
		const userRef = collection(db, 'users');

		// Create the base user query (no previous query)
		const userQuery = query(
			userRef,
			where('usernameLower', '>=', searchText.toLowerCase()),
			where('usernameLower', '<', searchText.toLowerCase() + '\uf8ff'),
			orderBy('usernameLower'),
			limit(5)
		);

		// If there's a starting point, create a new query starting at that point
		// (fetch next 5 documents starting after the starting point)
		if (startingPoint) {
			console.log("starting point")
			console.log(JSON.stringify(startingPoint, null, 3))
			const nextUserQuery = query(
				userRef,
				where('usernameLower', '>=', searchText.toLowerCase()),
				where('usernameLower', '<', searchText.toLowerCase() + '\uf8ff'),
				orderBy('usernameLower'),
				limit(5),
				startAfter(startingPoint));

			const results = await getDocs(nextUserQuery);
			const documents = results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			const nextStartingPoint = results.docs[results.docs.length - 1]?.data().usernameLower;

			console.log("setting starting point: ", nextStartingPoint)
			return { documents, nextStartingPoint };
		} else {
			// If there's no starting point, execute the base query
			console.log("no starting point")
			const results = await getDocs(userQuery);
			const documents = results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			const newStartingPoint = results.docs[results.docs.length - 1]?.data().usernameLower;

			console.log("setting starting point: ", newStartingPoint)
			return { documents, newStartingPoint };
		}

	}

	static async searchContent(searchText: string, startingPoint = null) {
		console.log("Searching... (from service)")
		console.log("Searching for specific content...")
		const contentRef = collection(db, 'contents');

		// Create the base query
		const contentQuery = query(
			contentRef,
			where('titleLower', '>=', searchText.toLowerCase()),
			where('titleLower', '<', searchText.toLowerCase() + '\uf8ff'),
			orderBy('titleLower'),
			limit(5)
		);

		// If there's a starting point, create a new query starting at that point
		if (startingPoint) {
			console.log("starting point")
			console.log(startingPoint)
			const nextContentQuery = query(
				contentRef,
				where('titleLower', '>=', searchText.toLowerCase()),
				where('titleLower', '<', searchText.toLowerCase() + '\uf8ff'),
				orderBy('titleLower'),
				limit(5),
				startAfter(startingPoint));

			const results = await getDocs(nextContentQuery);
			const documents = results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			const nextStartingPoint = results.docs[results.docs.length - 1]?.data().titleLower;

			console.log("setting starting point: ", nextStartingPoint)
			return { documents, nextStartingPoint };
		} else {
			// If there's no starting point, execute the base query
			console.log("no starting point")
			const results = await getDocs(contentQuery);
			const documents = results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			const newStartingPoint = results.docs[results.docs.length - 1]?.data().titleLower;

			console.log("setting starting point: ", newStartingPoint)
			return { documents, newStartingPoint };
		}
	};
}



export default SearchService;
