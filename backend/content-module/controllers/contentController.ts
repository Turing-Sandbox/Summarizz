import { Request, Response } from "express";
import { ContentService } from "../services/serviceContent";
import { IncomingForm } from "formidable";
import { StorageService } from "../../storage-module/services/serviceStorage";
// import { arrayUnion, doc, updateDoc, getDoc } from "firebase/firestore";
// import { db } from "../../shared/firebaseConfig";
// import { addSharedContentToUser } from "../../user-module/services/userService";
// import axios from "axios";

export class ContentController {
  static async createContent(req: Request, res: Response) {
    console.log("Creating Content...");
    const { creatorUID, title, content, thumbnailUrl } = req.body;

    try {
      const response = await ContentService.createContent(
        creatorUID,
        title,
        content,
        thumbnailUrl
      );
      res.status(201).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create content" });
    }
  }

  static async uploadThumbnail(req: Request, res: Response) {
    console.log("Uploading Thumbnail...");
    console.log(req.body);
    console.log(req.params);
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form: ", err);
        return res.status(500).json({ error: "Failed to upload thumbnail." });
      }

      const file = files.thumbnail[0];
      const fileName = file.newFilename;
      const fileType = file.mimetype;

      // Upload thumbnail to storage
      try {
        // Upload thumbnail
        const response = await StorageService.uploadFile(
          file,
          "thumbnails",
          fileName,
          fileType
        );
        res.status(201).json(response);
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ error: error.message || "Failed to upload thumbnail" });
      }
    });
  }

  static async getContent(req: Request, res: Response) {
    console.log("Fetching Content...");
    const { contentId } = req.params;

    try {
      const response = await ContentService.getContent(contentId);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch content" });
    }
  }

  static async editContent(req: Request, res: Response) {
    console.log("Fetching Content...");
    const { contentId, userId } = req.params;
    const { data } = req.body;

    console.log("edit body: ", req.body);
    console.log(data);

    try {
      // const confirmation = await axios.get(`${apiURL}/content/${contentId}`)
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;
      console.log(owner_id);
      console.log(userId);
      console.log(confirmation);
      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        const response = await ContentService.editContent(contentId, data);
        res.status(200).json(response);
      } else {
        throw Error("You do not have this permission.");
      }
    } catch (error) {
      console.log(error);
      res
        .status(401)
        .json({ error: error.message || "Failed to edit content" });
    }
  }

  static async editContentAndThumbnail(req: Request, res: Response) {
    console.log("Editing Content and Thumbnail...");
    const { contentId, userId } = req.params;
    console.log("Content ID: ", contentId);
    console.log("User ID: ", userId);

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;
      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        console.log("User is authorized to edit");

        let file_path: string;
        let file_name: string;
        if (confirmation.thumbnail) {
          file_path = decodeURIComponent(
            confirmation.thumbnail.split("/o/")[1].split("?")[0]
          ); //Converts things like "%2F" to "/", etc.
          file_name = file_path.split("/")[1]; // The line above returns thumbnails/filename, this line returns filename.
        }

        console.log("Form is being created:...");
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form: ", err);
            return res
              .status(500)
              .json({ error: "Failed to upload thumbnail." });
          }

          const file = files.thumbnail[0];
          let fileName: string;

          if (file_name) {
            fileName = file_name;
          } else {
            fileName = file.newFilename;
          }
          const fileType = file.mimetype;

          try {
            const response = await StorageService.uploadFile(
              file,
              "thumbnails",
              fileName,
              fileType
            );

            const updateData = JSON.parse(fields.data);
            updateData.thumbnail = response.url;
            console.log("updateData");
            await ContentService.editContent(contentId, updateData);
            res.status(201).json(response);
          } catch (error) {
            console.log(error);
            res
              .status(500)
              .json({ error: error.message || "Failed to upload thumbnail" });
          }
        });
      } else {
        res.status(401).json("You are not authorized to edit this content.");
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          error:
            error.message || "You are not authorized to edit this content.",
        });
    }
  }

  static async deleteContent(req: Request, res: Response) {
    console.log("Deleting Content...");
    const { contentId } = req.params;
    const { userId } = req.body;

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation.creatorUID;

      if (userId == owner_id) {
        const response = await ContentService.deleteContent(contentId);
        console.log("DELETING CONTENT:::::");
        console.log(response);

        res.status(200).json(response);
      } else {
        throw new Error("You don't have the permission to delete this!!");
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: error.message || "Failed to delete content" });
    }
  }

  // Like content
  static async likeContent(req: Request, res: Response) {
    console.log("Liking Content...");
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.likeContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error liking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to like content",
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }

  // Unlike content
  static async unlikeContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unlikeContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unliking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to unlike content",
      });
    }
  }

  // Bookmark content
  static async bookmarkContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.bookmarkContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error bookmarking content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to bookmark content",
      });
    }
  }

  // Unbookmark content
  static async unbookmarkContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unbookmarkContent(
        contentId,
        userId
      );
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unbookmarking content:", error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to unbookmark content",
      });
    }
  }

  // Share content
  static async shareContent(req: Request, res: Response) {
    const { userId, contentId } = req.params;

    try {
      // Call the service layer to handle *both* sharing and incrementing
      const updatedContent = await ContentService.shareContent(contentId, userId);

      // Return success response
      res.status(200).json({ content: updatedContent }); // Return the updated content
    } catch (error) {
      console.error("Error sharing content:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to share content",
      });
    }
  }

  // Unshare content
  static async unshareContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unshareContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unsharing content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to unshare content",
      });
    }
  }

  // Update the number of times the content was shared
  static async incrementShareCount(req: Request, res: Response) {
    const { contentId } = req.params;
    try {
      await ContentService.incrementShareCount(contentId);
      res.status(200).json("Successfully incremented!");
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to increment share count",
      });
    }
  }

  // Update the number of times the content was viewed
  static async incrementViewCount(req: Request, res: Response) {
    const { contentId } = req.params;
    try {
      await ContentService.incrementViewCount(contentId);
      res.status(200).json("Successfully incremented!");
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to increment view count",
      });
    }
  }

  static async getTrendingContent(req: Request, res: Response) {
    console.log("Fetching Trending Content...");
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    try {
      const trendingContent = await ContentService.getTrendingContent(limit);
      
      res.status(200).json({
        success: true,
        trendingContent,
        message: "Trending content fetched successfully"
      });
    } catch (error) {
      console.error("Error fetching trending content:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to fetch trending content" 
      });
    }
  }

  static async getAllContent(req: Request, res: Response) {
    console.log("Fetching All Content...");
    try {
      const allContent = await ContentService.getAllContent();
      
      res.status(200).json({
        success: true,
        content: allContent,
        message: "All content fetched successfully"
      });
    } catch (error) {
      console.error("Error fetching all content:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to fetch all content" 
      });
    }
  }

  static async getPersonalizedContent(req: Request, res: Response) {
    console.log("Fetching Personalized Content...");
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    try {
      console.log(`Getting personalized content for user: ${userId}`);
      const personalizedContent = await ContentService.getPersonalizedContent(userId, limit);
      
      res.status(200).json({
        success: true,
        personalizedContent,
        message: "Personalized content fetched successfully"
      });
    } catch (error) {
      console.error("Error fetching personalized content:", error);

      res.status(200).json({ 
        success: true,
        personalizedContent: [],
        message: "No personalized content available"
      });
    }
  }
}
