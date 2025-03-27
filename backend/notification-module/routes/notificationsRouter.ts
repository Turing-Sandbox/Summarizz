// this entire file is for testing purposes only, notifications will be sent on content interactions and not on HTTP requests
import { Router } from "express";
import { notificationController } from "../controllers/notificationController";

const notificationRoutes = Router();

notificationRoutes.get(`/`, notificationController.getNotifications);
notificationRoutes.post(`/:userId/:notificationId`, notificationController.markAsRead);
notificationRoutes.post(`/create`, notificationController.pushNotification);
