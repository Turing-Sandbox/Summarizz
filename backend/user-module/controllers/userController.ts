// src/modules/user/controllers/userController.ts
import { Request, Response } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  register,
  login,
} from "../services/userService";

// Register User
export async function registerUserController(req: Request, res: Response) {
  const { user } = req.body;
  try {
    await register(user.email, user.password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

// Login User
export async function loginUserController(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    await login(email, password);
    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to login user" });
  }
}

// Create User
export async function createUserController(req: Request, res: Response) {
  const { user } = req.body;
  try {
    await createUser(user);
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

// Get User
export async function getUserController(req: Request, res: Response) {
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
