import { Router } from "express";
import { preferencesController } from "../controllers/preferences.controller";
const preferencesRoutes = Router();

preferencesRoutes.get(`/:userId`, preferencesController.getUserPreferences);
preferencesRoutes.put(`/:userId`, preferencesController.updateUserPreferences);
