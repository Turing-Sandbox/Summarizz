import { realtime_db } from '../../shared/firebaseConfig';
import { ref, get, set, remove, update, child, push } from 'firebase/database';
import { Comment } from '../models/commentModel';


export async function createComment(post_id: string, owner_id: string, text: string): Promise<Comment> {
	const commentsRef = ref(realtime_db, `comments/${post_id}`);
	const newCommentID = push(commentsRef).key
	const time = Date.now()
	const newComment: Comment = {
		post_id: post_id,
		comment_id: newCommentID,
		owner_id: owner_id,
		text: text,
		timestamp: time,
		last_edited_timestamp: time,
		like_count: 0,
	}
	await set(child(commentsRef, newCommentID), newComment);
	console.log(newComment)
	return newComment;
}

export async function getComment(post_id: string, commentId: string): Promise<Comment | null> {
	const commentsRef = ref(realtime_db, `comments/${post_id}/${commentId}`);
	const snapshot = await get(commentsRef);
	return snapshot.val();
}

export async function updateComment(post_id: string, commentId: string, updatedComment: Partial<Comment>): Promise<void> {
	const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`);
	console.log("updated: ", updatedComment)
	const doesExist = await get(commentRef)
	updatedComment.last_edited_timestamp = Date.now()
	if (doesExist.exists()) {
		await update(commentRef, updatedComment);
	} else {
		throw "The requested comment does not exist."
	}
}


export async function deleteComment(post_id: string, commentId: string): Promise<void> {
	const commentRef = ref(realtime_db, `comments/${post_id}/${commentId}`);
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
export async function getAllComments(post_id: string): Promise<Comment[]> {
	const commentsRef = ref(realtime_db, `comments/${post_id}`);
	const snapshot = await get(commentsRef);

	if (snapshot.exists()) {
		return snapshot.val();
	} else {
		return [];
	}
}


