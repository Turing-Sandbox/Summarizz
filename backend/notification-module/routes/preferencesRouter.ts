import { Router } from "express";
import { preferencesController } from "../controllers/preferencesController";
const notificationRoutes = Router();

notificationRoutes.get(`/:userId`, preferencesController.getUserPreferences);
notificationRoutes.put(`/:userId`, preferencesController.updateUserPreferences);
