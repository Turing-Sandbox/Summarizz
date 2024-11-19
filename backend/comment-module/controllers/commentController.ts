import { getComment, getAllComments, updateComment, createComment, deleteComment } from '../services/commentService';
import { Request, Response } from 'express';

export async function createCommentController(req: Request, res: Response): Promise<void> {
	const { owner_id, text } = req.body;
	try {
		const creation = await createComment(owner_id, text);
		res.status(201).json({ message: 'Comment created successfully' + creation });
	} catch (error) {
		console.log(error)
		console.log("req.body", req.body)
		console.log("req.params", req.params)
		console.log(owner_id, text)
		res.status(500).json({ error: error });
	}
}

export async function getCommentController(req: Request, res: Response) {
	const { comment_id } = req.params;
	try {
		console.log("req.body", req.body)
		console.log("req.params", req.params)
		console.log("comment_id", comment_id)
		const comment = await getComment(comment_id);
		if (comment) res.status(200).json(comment);
		else res.status(404).json({ error: 'Comment not found' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch comment' });
		console.log(error)
	}
}

export async function updateCommentController(req: Request, res: Response) {
	const { comment_id } = req.params;
	const updatedComment = req.body;
	try {
		console.log("req.body", req.body)
		console.log("req.params", req.params)
		await updateComment(comment_id, updatedComment);
		res.status(200).json({ message: 'Comment updated successfully' });
	} catch (error) {
		res.status(500).json({ error: 'Failed to update comment' });
		console.log(error)
	}
}

export async function deleteCommentController(req: Request, res: Response) {
	const { comment_id } = req.params;
	try {
		console.log("req.body", req.body)
		console.log("req.params", req.params)
		await deleteComment(comment_id);
		res.status(200).json({ message: 'Comment deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error });
		console.log(error)
	}
}

export async function getAllCommentsController(req: Request, res: Response): Promise<void> {
	try {
		console.log("req.body", req.body)
		console.log("req.params", req.params)
		const comments = await getAllComments();

		if (Object.keys(comments).length > 0) {
			res.status(200).json(comments);
		} else {
			res.status(404).json({ message: 'No comments found' });
		}
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).json({ error: 'Failed to fetch comments' });
		console.log(error)
	}
}

