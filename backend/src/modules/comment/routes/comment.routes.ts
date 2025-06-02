import { Router } from "express";
import {
  updateCommentController,
  createCommentController,
  deleteCommentController,
  getCommentsByPostController,
  getCommentByIdController,
} from "../controllers/comment.controller";
import { authenticateToken } from "../../../shared/middleware/auth";
const router = Router();

// Post routes
router.post("/content/:contentId", authenticateToken, createCommentController);

// Get routes
router.get(
  "/content/:contentId",
  authenticateToken,
  getCommentsByPostController
);
router.get(
  "/:commentId/content/:contentId",
  authenticateToken,
  getCommentByIdController
);

// Put routes
router.put(
  "/:commentId/content/:contentId",
  authenticateToken,
  updateCommentController
);

// Delete routes
router.delete(
  "/:commentId/content/:contentId",
  authenticateToken,
  deleteCommentController
);

export default router;
