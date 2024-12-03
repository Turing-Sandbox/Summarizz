import { Router } from "express";
import {
  getUserController,
  updateUserController,
  deleteUserController,
  registerUserController,
  loginUserController,
  followCreatorController,
  unfollowCreatorController
} from "../controllers/userController";
import { followCreator } from "../services/userService";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID

router.post("/:userId/follow/:creatorId", followCreatorController); // Follow creator
router.post("/:userId/unfollow/:creatorId", unfollowCreatorController); // Unfollow creator

export default router;
