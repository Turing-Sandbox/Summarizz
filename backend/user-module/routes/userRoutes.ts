import { Router } from "express";
import {
  createUserController,
  getUserController,
  updateUserController,
  deleteUserController,
  registerUserController,
  loginUserController,
} from "../controllers/userController";

const router = Router();

router.post("/register", registerUserController); // Register a user
router.post("/login", loginUserController); // Login a user

router.post("/users", createUserController); // Create a user
router.get("/users/:uid", getUserController); // Get a user by UID
router.put("/users/:uid", updateUserController); // Update a user by UID
router.delete("/users/:uid", deleteUserController); // Delete a user by UID

export default router;
