import { Request, Response } from "express";
import SearchService from "../services/searchService";

export class SearchController {

	static async searchUsers(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		const userStartingPoint = query.userStartingPoint;

		console.log("searching users")
		try {
			const response = await SearchService.searchUsers(searchText, userStartingPoint);
			res.status(200).json(response);
		} catch (error) {
			console.error(`Error searching: ${error}`);
			throw Error(error)
		}

	}


	static async searchContent(req: Request, res: Response) {
		const query: Record<string, any> = req.query;

		const searchText = query.searchText;
		const contentStartingPoint = query.contentStartingPoint;

		console.log("searching content")
		try {
			const response = await SearchService.searchContent(searchText, contentStartingPoint);
			res.status(200).json(response);
		} catch (error) {
			console.error(`Error searching: ${error}`);
			throw Error(error)
		}

	}
}
