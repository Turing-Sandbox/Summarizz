import { Router } from "express";
import {
  getUserController,
  updateUserController,
  deleteUserController,
  registerUserController,
  loginUserController,
} from "../controllers/userController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

router.get("/:uid", getUserController); // Get a user by UID
router.put("/:uid", updateUserController); // Update a user by UID
router.delete("/:uid", deleteUserController); // Delete a user by UID

export default router;
