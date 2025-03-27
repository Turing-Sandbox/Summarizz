import { Request, Response } from "express";
import { getNotifications, pushNotification, markAsRead, bundleNotifications } from "../services/notificationService";

class NotificationController {
	async pushNotification(req: Request, res: Response) {
		const { userId, notification } = req.body;
		try {
			await pushNotification(userId, notification);
			res.status(201).send('Notification pushed successfully');
		} catch (error) {
			console.error('Error pushing notification:', error);
			res.status(500).send('Error pushing notification');
		}
	}

	async markAsRead(req: Request, res: Response) {
		const { userId, notificationId } = req.params;
		try {
			await markAsRead(userId, notificationId);
			res.status(200).send(`Notification ${notificationId} marked as read`);
		}
		catch (error) {
			console.error(`Error marking ${notificationId} as read.`)
			res.status(500).send(`Error marking ${notificationId} as read.`)
		}
	}

	async getNotifications(req: Request, res: Response) {
		const { userId } = req.params;
		try {
			const notifications = await getNotifications(userId);
			res.status(200).json(notifications);
		} catch (error) {
			console.error('Error retrieving notifications:', error);
			res.status(500).send('Error retrieving notifications');
		}
	}
}

export const notificationController = new NotificationController();
