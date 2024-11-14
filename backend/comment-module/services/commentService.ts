import { database } from '../../shared/firebaseConfig';
import { ref, get, set, remove, update, child, push } from 'firebase/database';
import { Comment } from '../models/commentModel';

export class CommentService {
	private commentsRef = ref(database, "comments");

	async createComment(owner_id: string, text: string): Promise<Comment> {
		const newCommentID = push(this.commentsRef).key
		const newComment: Comment = {
			comment_id: newCommentID,
			owner_id: owner_id,
			text: text,
			timestamp: Date.now(),
		}
		await set(this.commentsRef, newComment);
		return newComment;
	}

	async getComment(commentId: string): Promise<Comment | null> {
		const snapshot = await get(child(this.commentsRef, commentId));
		return snapshot.val();
	}

	async updateComment(commentId: string, updatedComment: Partial<Comment>): Promise<void> {
		await update(child(this.commentsRef, commentId), updatedComment);
	}

	async deleteComment(commentId: string): Promise<void> {
		await remove(child(this.commentsRef, commentId))
	}

	async getAllComments(): Promise<Comment[]> {
		const snapshot = await get(this.commentsRef);
		const comments: Comment[] = [];
		snapshot.forEach(childSnapshot => {
			comments.push(childSnapshot.val() as Comment);
		});
		return comments;
	}
}
