import { Request, Response } from 'express';
import { updateUserPreferences, getUserPreferences } from '../services/preferences.service';

class PreferencesController {
	async getUserPreferences(req: Request, res: Response) {
		const { userId } = req.params;
		try {
			const preferences = await getUserPreferences(userId);
			res.status(200).json(preferences);
		} catch (error) {
			console.error('Error retrieving user preferences:', error);
			res.status(500).send('Error retrieving user preferences');
		}
	}

	async updateUserPreferences(req: Request, res: Response) {
		const { userId } = req.params;
		const preferences = req.body;
		try {
			await updateUserPreferences(userId, preferences);
			res.status(200).send('User preferences updated successfully');
		} catch (error) {
			console.error('Error updating user preferences:', error);
			res.status(500).send('Error updating user preferences');
		}
	}
}

export const preferencesController = new PreferencesController();
