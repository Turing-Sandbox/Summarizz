import { Request, Response } from "express";
import SearchService from "../services/search.service";
import { logger } from "../../../shared/utils/logger";
import { searchType } from "../types";


export class SearchController {
  /**
   * @description
   * Searches for users and/or content that matches the provided search text.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
  static async search(req: Request, res: Response) {
    const searchText = req.query.searchText as string;
    const searchType = req.query.searchType as searchType;
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    logger.info(`Searching for users and content that match the following: ${searchText}`);
    try {
      const response = await SearchService.search(
        searchText,
        searchType,
        limit,
        offset,
      );
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error searching for ${searchType}: ${error.message}`);
      } else {
        logger.error(`Error searching for ${searchType}: ${error}`);
      }
      res.status(500).json({error: "Failed to search users"});
    }
  }
}

