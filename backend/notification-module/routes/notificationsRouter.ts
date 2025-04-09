// this entire file is for testing purposes only, notifications will be sent on content interactions and not on HTTP requests
import { Router } from "express";
import { notificationController } from "../controllers/notificationController";

const notificationRoutes = Router();

notificationRoutes.get(`/:userId`, notificationController.getNotifications);
notificationRoutes.get(`/unread/:userId`, notificationController.getNewNotifications);
notificationRoutes.post(`/:userId/:notificationId`, notificationController.markAsRead);
notificationRoutes.post(`/create`, notificationController.pushNotification);

export default notificationRoutes;
