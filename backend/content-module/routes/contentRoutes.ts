import { Router } from "express";
import { ContentController } from "../controllers/contentController";

const contentRoutes = Router();

contentRoutes.post("/", ContentController.createContent); // Create new content
contentRoutes.post("/uploadThumbnail", ContentController.uploadThumbnail); // Upload thumbnail

contentRoutes.get("/feed/trending", ContentController.getTrendingContent); // Get trending content
contentRoutes.get("/feed/:userId", ContentController.getPersonalizedContent); // Get personalized content

contentRoutes.get("/", ContentController.getAllContent); // Get all content
contentRoutes.get("/:contentId", ContentController.getContent); // Get content by ID

contentRoutes.put("/views/:contentId", ContentController.incrementViewCount); // Increment the view count
contentRoutes.put("/shares/:contentId", ContentController.incrementShareCount); // Increment the share count

contentRoutes.delete("/:contentId", ContentController.deleteContent); // Delete content by ID

contentRoutes.put("/:contentId/:userId", ContentController.editContent); // Edit content by ID
contentRoutes.put(
  "/editThumbnail/:contentId/:userId",
  ContentController.editContentAndThumbnail
); // Edit content by ID

contentRoutes.post("/:contentId/like/:userId", ContentController.likeContent); // Like content
contentRoutes.post(
  "/:contentId/unlike/:userId",
  ContentController.unlikeContent
); // Unlike content

contentRoutes.post(
  "/:userId/bookmark/:contentId",
  ContentController.bookmarkContent
); // Bookmark content
contentRoutes.post(
  "/:userId/unbookmark/:contentId",
  ContentController.unbookmarkContent
); // Unbookmark content

contentRoutes.post(
  "/:contentId/user/:userId/share",
  ContentController.shareContent
); // Share content
contentRoutes.post(
  "/:contentId/user/:userId/unshare",
  ContentController.unshareContent
); // Unshare content

export default contentRoutes;
