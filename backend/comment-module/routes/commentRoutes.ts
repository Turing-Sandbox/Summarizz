import { Router } from 'express';
import {
    updateCommentController,
    createCommentController,
    deleteCommentController,
    getCommentsByPostController,
    getCommentByIdController, deletePostController
} from '../controllers/commentController';
const router = Router();

router.post('/comments/:post_id', createCommentController);
router.get('/comments/:post_id/', getCommentsByPostController);
router.get('/comments/:post_id/:comment_id', getCommentByIdController);
router.put('/comments/:post_id/:comment_id', updateCommentController);
router.delete('/post/:post_id/', deletePostController);
router.delete('/comments/:post_id/:comment_id', deleteCommentController);

export default router;
