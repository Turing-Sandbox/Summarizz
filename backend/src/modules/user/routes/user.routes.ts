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
  refreshUserController,
  logoutUserController,
  getRelatedContentCreatorsController,
} from "../controllers/user.controller";
import { requestPasswordResetController } from "../controllers/password_reset.controller";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user
router.post("/refresh-token", refreshUserController); // Refresh token route - using Firebase directly
router.post("/logout", logoutUserController); // Logout a user

// Password reset route - using Firebase directly
router.post("/reset-password-request", requestPasswordResetController); // Request password reset

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID
router.post("/upload-profile-image", uploadProfileImageController); // Upload Profile Image

router.get("/:uid/related-content-creators", getRelatedContentCreatorsController); // Get related content creator

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
