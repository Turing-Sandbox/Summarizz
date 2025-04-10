import { Router } from "express";
import { preferencesController } from "../controllers/preferencesController";
const preferenceRoutes = Router();

preferenceRoutes.get(`/:userId`, preferencesController.getUserPreferences);
preferenceRoutes.put(`/:userId`, preferencesController.updateUserPreferences);
