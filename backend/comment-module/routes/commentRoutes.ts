import { Router } from 'express';
import { updateComment, createComment, getComment, deleteComment } from '../controllers/commentController';
const router = Router();

router.post('/comments', createComment);         // Create a user
router.get('/comments/:comment_id', getComment);        // Get a user by UID
router.put('/comments/:comment_id', updateComment);     // Update a user by UID
router.delete('/comments/:comment_id', deleteComment);  // Delete a user by UID

export default router;
