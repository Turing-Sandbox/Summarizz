import { Router } from "express";

import { SearchController } from "../controllers/search.controller";
const searchRoutes = Router();

searchRoutes.get("/users", SearchController.searchUsers);
searchRoutes.get("/contents", SearchController.searchContents);

export default searchRoutes;
