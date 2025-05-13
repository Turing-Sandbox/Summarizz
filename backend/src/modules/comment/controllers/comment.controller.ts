import {
	createComment,
	deleteComment,
	deletePost,
	getAllComments,
	getComment,
	updateComment
} from '../services/comment.service';
import {ContentService} from '../../content/services/content.service'
import {Request, Response} from 'express';
import {getUser} from "../../user/services/user.service";

export async function createCommentController(req: Request, res: Response): Promise<void> {
	const { post_id } = req.params
	const { owner_id, text } = req.body;
	try {
		const response = await getUser(owner_id);
		const creation = await createComment(post_id, owner_id, text, response.username);
		res.status(201).json({ message: 'Comment created successfully', creation});
	} catch (error) {
		console.log(error)
		console.log(post_id, owner_id, text)
		res.status(500).json({ error: error });
	}
	}

	export async function getCommentByIdController(req: Request, res: Response) {
	const { post_id, comment_id } = req.params;
	try {
		const comment = await getComment(post_id, comment_id);
		console.log(comment)
		if (comment) res.status(200).json(comment);
		else res.status(404).json(null);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch comment' });
		console.log(error)
	}
}

export async function updateCommentController(req: Request, res: Response) {
	const { post_id, comment_id, user_id} = req.params;
	const comment = await getComment(post_id, comment_id)
	if (comment.owner_id == user_id){
		const updatedComment = req.body;
		try {
			await updateComment(post_id, comment_id, updatedComment);
			res.status(200).json({ message: 'Comment updated successfully' });
		} catch (error) {
			res.status(500).json({ error: 'Failed to update comment' });
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function deleteCommentController(req: Request, res: Response) {
	const { post_id, comment_id, user_id} = req.params;
	const comment = await getComment(post_id, comment_id)
	if (comment.owner_id == user_id){
		try {
			await deleteComment(post_id, comment_id);
			res.status(200).json({ message: 'Comment deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error });
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function deletePostController(req: Request, res: Response) {
	const { post_id, user_id } = req.params;
	const post = await ContentService.getContent(post_id)
	const creator_id = post.creatorUID
	if (creator_id == user_id){
		try {
			await deletePost(post_id);
			res.status(200).json({ message: 'Post (entire comment tree) deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error + " " + post_id});
			console.log(error)
		}
	} else {
		res.status(401).json({ error: 'You do not have permission to try this.'});
	}
}

export async function getCommentsByPostController(req: Request, res: Response): Promise<void> {
	const { post_id } = req.params;
	try {
		const comments = await getAllComments(post_id);

		if (Object.keys(comments).length > 0) {
			res.status(200).json(comments);
		} else {
			res.status(200).json(null);
		}
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).json({ error: 'Failed to fetch comments' });
		console.log("GET ALL COMMENTS ERROR: ", error)
	}
}
