import { Router } from "express";
import {
  updateCommentController,
  createCommentController,
  deleteCommentController,
  getCommentsByPostController,
  getCommentByIdController,
} from "../controllers/comment.controller";
import { authenticateToken } from "../../../shared/middleware/auth";

const commentRouter = Router();

// Post routes
commentRouter.post(
  "/:contentId/comment",
  authenticateToken,
  createCommentController
);

// Get routes
commentRouter.get(
  "/:contentId/comments",
  authenticateToken,
  getCommentsByPostController
);
commentRouter.get(
  "/:contentId/comment/:commentId",
  authenticateToken,
  getCommentByIdController
);

// Put routes
commentRouter.put(
  "/:contentId/comment/:commentId",
  authenticateToken,
  updateCommentController
);

// Delete routes
commentRouter.delete(
  "/:contentId/comment/:commentId",
  authenticateToken,
  deleteCommentController
);

export default commentRouter;
