import { Router } from "express";

import { SearchController } from "../controllers/search.controller";
const searchRoutes = Router();

searchRoutes.get("/", SearchController.search);

export default searchRoutes;
