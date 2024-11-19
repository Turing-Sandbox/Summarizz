import { realtime_db } from '../../shared/firebaseConfig';
import { ref, get, set, remove, update, child, push } from 'firebase/database';
import { Comment } from '../models/commentModel';


export async function createComment(owner_id: string, text: string): Promise<Comment> {
	const commentsRef = ref(realtime_db, "comments");
	const newCommentID = push(commentsRef).key
	const newComment: Comment = {
		comment_id: newCommentID,
		owner_id: owner_id,
		text: text,
		timestamp: Date.now(),
	}
	await set(child(commentsRef, newCommentID), newComment);
	console.log(newComment)
	return newComment;
}

export async function getComment(commentId: string): Promise<Comment | null> {
	const commentsRef = ref(realtime_db, "comments");
	const snapshot = await get(child(commentsRef, commentId));
	return snapshot.val();
}

export async function updateComment(commentId: string, updatedComment: Partial<Comment>): Promise<void> {
	const commentRef = ref(realtime_db, "comments/" + commentId);
	console.log("updated: ", updatedComment)
	const doesExist = await get(commentRef)
	if (doesExist.exists()) {
		await update(commentRef, updatedComment);
	} else {
		throw "The requested comment does not exist."
	}
}


export async function deleteComment(commentId: string): Promise<void> {
	const commentRef = ref(realtime_db, "comments/" + commentId);
	const doesExist = await get(commentRef)
	if (doesExist.exists()) {
		console.log(doesExist.val())
		console.log(doesExist.exists())
		await remove(commentRef)
	} else {
		console.log(doesExist.val())
		throw "The requested comment does not exist."
	}
}

// Function to fetch comments from the database
export async function getAllComments(): Promise<Comment[]> {
	const commentsRef = ref(realtime_db, 'comments');
	const snapshot = await get(commentsRef);

	if (snapshot.exists()) {
		return snapshot.val();
	} else {
		return [];
	}
}


