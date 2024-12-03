// src/modules/user/controllers/userController.ts
import e, { Request, Response } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  register,
  login,
  followCreator,
  unfollowCreator,
} from "../services/userService";

// Register User
export async function registerUserController(req: Request, res: Response) {
  console.log("Registering user...");
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const response = await register(
      firstName,
      lastName,
      username,
      email,
      password
    );
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
}

// Login User
export async function loginUserController(req: Request, res: Response) {
  console.log("Logging in user...");
  const { email, password } = req.body;

  try {
    const response = await login(email, password);
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Failed to login user" });
  }
}

// Create User
export async function createUserController(req: Request, res: Response) {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    await createUser(firstName, lastName, username, email, password);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

// Get User
export async function getUserController(req: Request, res: Response) {
  console.log("Fetching user...");
  const { uid } = req.params;

  try {
    const user = await getUser(uid);
    if (user) res.status(200).json(user);
    else res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// Update User
export async function updateUserController(req: Request, res: Response) {
  const { uid } = req.params;
  const data = req.body;
  try {
    await updateUser(uid, data);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

// Delete User
export async function deleteUserController(req: Request, res: Response) {
  const { uid } = req.params;
  try {
    await deleteUser(uid);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

// Follow Creator
export async function followCreatorController(req: Request, res: Response) {
  console.log("Following creator...");
  const { userId, creatorId } = req.params;
  try {
    await followCreator(userId, creatorId);
    res.status(200).json({ message: "Creator followed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to follow creator" });
  }
}

// Unfollow Creator
export async function unfollowCreatorController(req: Request, res: Response) {
  const { userId, creatorId } = req.params;
  try {
    await unfollowCreator(userId, creatorId);
    res.status(200).json({ message: "Creator unfollowed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to unfollow creator" });
  }
}
