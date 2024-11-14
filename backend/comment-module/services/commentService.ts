import { database } from '../../shared/firebaseConfig';
import { ref, get, set, remove, update, child, push } from 'firebase/database';
import { Comment } from '../models/commentModel';


export async function createComment(owner_id: string, text: string): Promise<Comment> {
	const commentsRef = ref(database, "comments");
	const newCommentID = push(commentsRef).key
	const newComment: Comment = {
		comment_id: newCommentID,
		owner_id: owner_id,
		text: text,
		timestamp: Date.now(),
	}
	await set(commentsRef, newComment);
	return newComment;
}

export async function getComment(commentId: string): Promise<Comment | null> {
	const commentsRef = ref(database, "comments");
	const snapshot = await get(child(commentsRef, commentId));
	return snapshot.val();
}

export async function updateComment(commentId: string, updatedComment: Partial<Comment>): Promise<void> {
	const commentsRef = ref(database, "comments");
	await update(child(commentsRef, commentId), updatedComment);
}

export async function deleteComment(commentId: string): Promise<void> {
	const commentsRef = ref(database, "comments");
	await remove(child(commentsRef, commentId))
}

export async function getAllComments(): Promise<Comment[]> {
	const commentsRef = ref(database, "comments");
	const snapshot = await get(commentsRef);
	const comments: Comment[] = [];
	snapshot.forEach(childSnapshot => {
		comments.push(childSnapshot.val() as Comment);
	});
	return comments;
}
