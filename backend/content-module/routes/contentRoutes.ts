import { Router } from "express";
import { ContentController } from "../controllers/contentController";

const contentRoutes = Router();

contentRoutes.post("/", ContentController.createContent); // Create new content
contentRoutes.post("/uploadThumbnail", ContentController.uploadThumbnail); // Upload thumbnail

export default contentRoutes;
