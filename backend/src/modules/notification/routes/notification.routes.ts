import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const notificationRoutes = Router();

notificationRoutes.get(`/unread/:userId`, notificationController.getNewNotifications);
notificationRoutes.get(`/:userId`, notificationController.getNotifications);
notificationRoutes.post(`/:userId/read`, notificationController.markAsRead);

export default notificationRoutes;
