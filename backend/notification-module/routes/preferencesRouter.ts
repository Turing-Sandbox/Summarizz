import { Router } from "express";
import { preferencesController } from "../controllers/preferencesController";
const preferencesRoutes = Router();

preferencesRoutes.get(`/:userId`, preferencesController.getUserPreferences);
preferencesRoutes.put(`/:userId`, preferencesController.updateUserPreferences);
