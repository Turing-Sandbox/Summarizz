import { Router } from "express";
import {
  getUserController,
  updateUserController,
  deleteUserController,
  registerUserController,
  loginUserController,
  followCreatorController,
  unfollowCreatorController,
  followUserController,
  unfollowUserController,
  requestFollowController,
} from "../controllers/userController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID

// Content View - Follow/Unfollow Creator
router.post("/:userId/follow/creator/:creatorId", followCreatorController); // Follow Creator
router.post("/:userId/unfollow/creator/:creatorId", unfollowCreatorController); // Unfollow Creator

// Profile View - Follow/Unfollow User
router.post("/:userId/follow/user/:targetId", followUserController); // Follow User
router.post("/:userId/unfollow/user/:targetId", unfollowUserController); // Unfollow User

// Profile View - Request Follow for Private Account
router.post("/:userId/request/:targetId", requestFollowController); // Request Follow

export default router;
