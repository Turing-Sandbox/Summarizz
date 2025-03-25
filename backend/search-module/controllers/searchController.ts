import { Request, Response } from "express";
import SearchService from "../services/searchService";
import { getLoggerWithContext } from "../../shared/loggingHandler";

const logger = getLoggerWithContext("SearchController");

export class SearchController {

	static async searchUsers(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		const userStartingPoint = query.userStartingPoint;

		logger.info(`Searching for users that match the following: ${searchText}`);
		try {
			const response = await SearchService.searchUsers(searchText, userStartingPoint);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching: ${error}`);
			throw Error(error)
		}
	}


	static async searchContent(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		logger.info(`Searching for content that matches the following: ${searchText}`);

		try {
			const response = await SearchService.searchContent(searchText);
			res.status(200).json(response);
		} catch (error) {
			logger.error(`Error searching: ${error}`);
			throw Error(error)
		}
	}
}
