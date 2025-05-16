import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const notificationRoutes = Router();

notificationRoutes.get(`/unread/:userId`, notificationController.getNewNotifications);
notificationRoutes.get(`/:userId`, notificationController.getNotifications);
notificationRoutes.post(`/:userId/:notificationId`, notificationController.markAsRead);
notificationRoutes.post(`/create`, notificationController.pushNotification);

export default notificationRoutes;
