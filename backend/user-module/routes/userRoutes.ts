import { Router } from 'express';
import { createUserController, getUserController, updateUserController, deleteUserController } from '../controllers/userController';

const router = Router();

router.post('/users', createUserController);         // Create a user
router.get('/users/:uid', getUserController);        // Get a user by UID
router.put('/users/:uid', updateUserController);     // Update a user by UID
router.delete('/users/:uid', deleteUserController);  // Delete a user by UID

export default router;