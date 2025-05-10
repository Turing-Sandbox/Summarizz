import { Request, Response } from "express";
import SearchService from "../services/searchService";
import { getLoggerWithContext } from "../../../shared/loggingHandler";

const logger = getLoggerWithContext("SearchController");

export class SearchController {
	/**
	 * @description
	 * Fetches 5 users at a time where their username matches or starts with the text 
	 * provided to the search query. If a starting point is provided, the search query 
	 * starts from the provided starting point.
	 * 
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	static async searchUsers(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		const userStartingPoint = query.userStartingPoint;

		logger.info(`Searching for users that match the following: ${searchText}`);
		try {
			const response = await SearchService.searchUsers(searchText, userStartingPoint);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching users: ${error.message || error}`);
			res.status(500).json({ error: 'Failed to search users' });
		}
	}

	/**
	 * @description
	 * Fetches 5 content items at a time where their title matches or starts with the
	 * text provided to the search query.
	 * 
	 * @param req - Express request object.
	 * @param res - Express response object.
	 */
	static async searchContent(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		logger.info(`Searching for content that matches the following: ${searchText}`);

		try {
			const response = await SearchService.searchContent(searchText);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching content: ${error.message || error}`);
			res.status(500).json({ error: 'Failed to search content' });
		}
	}
}
