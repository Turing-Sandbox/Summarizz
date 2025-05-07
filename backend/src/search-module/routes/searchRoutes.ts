import { Router } from "express";

import { SearchController } from "../controllers/searchController";
const searchRoutes = Router();

searchRoutes.get("/users/", SearchController.searchUsers);
searchRoutes.get("/content/", SearchController.searchContent);

export default searchRoutes;
