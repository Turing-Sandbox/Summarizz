import { getComment, getAllComments, updateComment, createComment, deleteComment } from '../services/commentService';
import { Request, Response } from 'express';

export async function createCommentController(req: Request, res: Response): Promise<void> {
	const { owner_id, text } = req.body;
	try {
		await createComment(owner_id, text);
		res.status(201).json({ message: 'Comment created successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create comment' });
	}
}

export async function getCommentController(req: Request, res: Response) {
	const { commentId } = req.params;
	try {
		const comment = await getComment(commentId);
		if (comment) res.status(200).json(comment);
		else res.status(404).json({ error: 'Comment not found' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch comment' });
	}
}

export async function updateCommentController(req: Request, res: Response) {
	const { commentId } = req.params;
	const { updatedComment } = req.body;
	try {
		await updateComment(commentId, updatedComment);
		res.status(200).json({ message: 'Comment updated successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to update comment' });
	}
}

export async function deleteCommentController(req: Request, res: Response) {
	const { commentId } = req.params;
	try {
		await deleteComment(commentId);
		res.status(200).json({ message: 'Comment deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete comment' });
	}
}

export async function getAllCommentsController(req: Request, res: Response): Promise<void> {
	try {
		const comments = await getAllComments();

		if (comments.length > 0) {
			res.status(200).json(comments);
		} else {
			res.status(404).json({ message: 'No comments found' });
		}
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).json({ error: 'Failed to fetch comments' });
	}
}

