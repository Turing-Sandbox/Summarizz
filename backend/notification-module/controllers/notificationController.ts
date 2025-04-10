import { Request, Response } from "express";
import { getNotifications, pushNotification, markAsRead, getNewNotifications } from "../services/notificationService";

class NotificationController {
	async pushNotification(req: Request, res: Response) {
		const { userId, notification } = req.body;
		
		// Validate required fields
		if (!userId) {
			return res.status(400).send('User ID is required');
		}
		
		if (!notification) {
			return res.status(400).send('Notification object is required');
		}
		
		// Validate notification object structure
		const requiredFields = ['userId', 'username', 'type', 'timestamp', 'read'];
		for (const field of requiredFields) {
			if (notification[field] === undefined) {
				return res.status(400).send(`Notification is missing required field: ${field}`);
			}
		}
		
		try {
			await pushNotification(userId, notification);
			res.status(201).send('Notification pushed successfully');
		} catch (error) {
			console.error('Error pushing notification:', error);
			res.status(500).send(`Error pushing notification: ${error.message}`);
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
			console.log(userId)
			const notifications = await getNotifications(userId);
			res.status(200).json(notifications);
		} catch (error) {
			console.error('Error retrieving notifications:', error);
			res.status(500).send('Error retrieving notifications');
		}
	}

	async getNewNotifications(req: Request, res: Response) {
		const { userId } = req.params;
		// Validate required parameters
		if (!userId) {
			return res.status(400).send('User ID is required');
		}
		try {
			const notifications = await getNewNotifications(userId);
			res.status(200).json(notifications);
		} catch (error) {
			console.error('Error retrieving notifications:', error);
			res.status(500).send(`Error retrieving notifications: ${error.message}`);
		}
	}
}

export const notificationController = new NotificationController();
