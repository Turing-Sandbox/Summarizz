import { Router } from "express";
import {
  getUserController,
  updateUserController,
  uploadProfileImageController,
  deleteUserController,
  registerUserController,
  loginUserController,
  followUserController,
  unfollowUserController,
  requestFollowController,
  changePasswordController,
  changeEmailUsernameController,
} from "../controllers/userController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID
router.post("/upload-profile-image", uploadProfileImageController); // Upload Profile Image

// Profile View - Follow/Unfollow User
router.post("/:userId/follow/user/:targetId", followUserController); // Follow User
router.post("/:userId/unfollow/user/:targetId", unfollowUserController); // Unfollow User

// Profile View - Request Follow for Private Account
router.post("/:userId/request/:targetId", requestFollowController); // Request Follow

// Profile Management - Change Password
router.post("/:userId/change-password", changePasswordController); // Change Password

// Profile Management - Change Email/Username
router.post("/:userId/change-email-username", changeEmailUsernameController);

export default router;
