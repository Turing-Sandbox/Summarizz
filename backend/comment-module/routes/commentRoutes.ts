import { Router } from 'express';
import { updateCommentController, createCommentController, getCommentController, deleteCommentController, getAllCommentsController } from '../controllers/commentController';
const router = Router();

router.post('/comments', createCommentController);
router.get('/comments', getAllCommentsController);
router.get('/comments/:comment_id', getCommentController);
router.put('/comments/:comment_id', updateCommentController);
router.delete('/comments/:comment_id', deleteCommentController);

export default router;
