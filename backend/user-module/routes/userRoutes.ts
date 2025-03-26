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
  approveFollowRequestController,
  rejectFollowRequestController, 
  changePasswordController,
  changeEmailController,
  changeUsernameController,
} from "../controllers/userController";
import { requestPasswordResetController } from "../controllers/passwordResetController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

// Password reset route - using Firebase directly
router.post("/reset-password-request", requestPasswordResetController); // Request password reset

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID
router.post("/upload-profile-image", uploadProfileImageController); // Upload Profile Image

// Profile View - Follow/Unfollow User
router.post("/:userId/follow/:targetId", followUserController); // Follow User
router.post("/:userId/unfollow/:targetId", unfollowUserController); // Unfollow User

// Profile View - Request Follow for Private Account
router.post("/:userId/request/:targetId", requestFollowController); // Request Follow
// Approve and Reject Follow Requests
router.post("/:userId/approve/:requesterId", approveFollowRequestController); // Approve Follow Request
router.post("/:userId/reject/:requesterId", rejectFollowRequestController); // Reject Follow Request

// Profile Management - Change Password
router.post("/:userId/change-password", changePasswordController); // Change Password

// Profile Management - Change Email/Username
router.post("/:userId/change-email", changeEmailController);
router.post("/:userId/change-username", changeUsernameController);

export default router;
