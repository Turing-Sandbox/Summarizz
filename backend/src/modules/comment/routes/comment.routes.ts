import { Router } from 'express';
import {
    updateCommentController,
    createCommentController,
    deleteCommentController,
    getCommentsByPostController,
    getCommentByIdController
} from '../controllers/comment.controller';
import { authenticateToken } from '../../../shared/middleware/auth';
const router = Router();

router.post('/:contentId', authenticateToken, createCommentController, );
router.get(
  "/:contentId",
  authenticateToken,
  getCommentsByPostController
);
router.get("/:commentId", authenticateToken, getCommentByIdController);
router.put("/:commentId", authenticateToken, updateCommentController);
router.delete("/:commentId", authenticateToken, deleteCommentController);

export default router;
