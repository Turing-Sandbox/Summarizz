import { CommentService } from '../services/commentService';
import { Comment } from '../models/commentModel';

export class CommentController {
	private commentService: CommentService;

	constructor() {
		this.commentService = new CommentService();
	}

	async createComment(owner_id: string, text: string): Promise<void> {
		await this.commentService.createComment(owner_id, text);
	}

	async getComment(commentId: string): Promise<Comment | null> {
		return await this.commentService.getComment(commentId);
	}

	async updateComment(commentId: string, updatedComment: Partial<Comment>): Promise<void> {
		await this.commentService.updateComment(commentId, updatedComment);
	}

	async deleteComment(commentId: string): Promise<void> {
		await this.commentService.deleteComment(commentId);
	}

	async getAllComments(): Promise<Comment[]> {
		return await this.commentService.getAllComments();
	}
}
