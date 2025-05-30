import { Request, Response } from "express";
import { ContentService } from "../services/content.service";
import { IncomingForm } from "formidable";
import { StorageService } from "../../storage/services/storage.service";

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
        .json({ error: (error as string) || "Failed to create content" });
    }
  }

  static async uploadThumbnail(req: Request, res: Response) {
    console.log("Uploading Thumbnail...");
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files: any) => {
      if (err) {
        console.error("Error parsing form: ", err);
        return res.status(500).json({ error: "Failed to upload thumbnail." });
      }

      // Check if files.thumbnail exists and is an array
      if (
        !files.thumbnail ||
        !Array.isArray(files.thumbnail) ||
        !files.thumbnail[0]
      ) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const file = files.thumbnail[0];
      const fileName = file.newFilename;
      const fileType = file.mimetype;
      const filePath = file.filepath; // Use 'filepath' for formidable v2+

      try {
        if (!filePath) {
          return res.status(400).json({ error: "File path is missing." });
        }

        // Pass the file object with the correct path to StorageService
        const response = await StorageService.uploadFile(
          { ...file, path: filePath }, // Ensure 'path' is set if your StorageService expects it
          "thumbnails",
          fileName,
          fileType,
        );
        res.status(201).json(response);
      } catch (error: any) {
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
    } catch (error: any) {
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

    try {
      // const confirmation = await axios.get(`${apiURL}/content/${contentId}`)
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation?.creatorUID;

      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        const response = await ContentService.editContent(contentId, data);
        res.status(200).json(response);
      } else {
        throw Error("You do not have this permission.");
      }
    } catch (error: any) {
      console.log(error);
      res
        .status(401)
        .json({ error: error.message || "Failed to edit content" });
    }
  }

  static async editContentAndThumbnail(req: Request, res: Response) {
    console.log("Editing Content and Thumbnail...");
    const { contentId, userId } = req.params;

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation?.creatorUID;
      if (userId == owner_id) {
        //check whether they are allowed to edit the content
        let file_path: string;
        let file_name: string;
        if (confirmation?.thumbnail) {
          file_path = decodeURIComponent(
            confirmation.thumbnail.split("/o/")[1].split("?")[0]
          ); //Converts things like "%2F" to "/", etc.
          file_name = file_path.split("/")[1]; // The line above returns thumbnails/filename, this line returns filename.
        }

        console.log("Form is being created:...");
        const form = new IncomingForm();
        form.parse(req, async (err, fields: any, files: any) => {
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
            if (!file) {
              return res.status(400).json({ error: "No file uploaded." });
            }

            const response = await StorageService.uploadFile(
              file,
              "thumbnails",
              fileName,
              fileType,
            );

            const updateData = JSON.parse(fields.data);
            updateData.thumbnail = response.url;
            console.log("updateData");
            await ContentService.editContent(contentId, updateData);
            res.status(201).json(response);
          } catch (error: any) {
            console.log(error);
            res
              .status(500)
              .json({ error: error.message || "Failed to upload thumbnail" });
          }
        });
      } else {
        res.status(401).json("You are not authorized to edit this content.");
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        error: error.message || "You are not authorized to edit this content.",
      });
    }
  }

  static async deleteContent(req: Request, res: Response) {
    console.log("Deleting Content...");
    const { contentId } = req.params;
    const { userId } = req.body;

    try {
      const confirmation = await ContentService.getContent(contentId);
      const owner_id = confirmation?.creatorUID;

      if (userId == owner_id) {
        const response = await ContentService.deleteContent(contentId);
        console.log("DELETING CONTENT:::::");
        console.log(response);

        res.status(200).json(response);
      } else {
        throw new Error("You don't have the permission to delete this!!");
      }
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      const updatedContent = await ContentService.shareContent(
        contentId,
        userId
      );

      // Return success response
      res.status(200).json({ content: updatedContent }); // Return the updated content
    } catch (error: any) {
      console.error("Error sharing content:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to share content",
      });
    }
  }

  // Unshare content
  static async unshareContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unshareContent(contentId, userId);
      res.status(200).json(response);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to increment share count",
      });
    }
  }

  //  Update the number of times the content was viewed
  static async incrementViewCount(req: Request, res: Response) {
    const { contentId } = req.params;
    try {
      await ContentService.incrementViewCount(contentId);
      res.status(200).json("Successfully incremented!");
    } catch (error: any) {
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    try {
      const trendingContent = await ContentService.getTrendingContent(limit);

      res.status(200).json({
        success: true,
        trendingContent,
        message: "Trending content fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching trending content:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch trending content",
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
        message: "All content fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching all content:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch all content",
      });
    }
  }

  static async getPersonalizedContent(req: Request, res: Response) {
    console.log("Fetching Personalized Content...");
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    try {
      console.log(`Getting personalized content for user: ${userId}`);
      const personalizedContent = await ContentService.getPersonalizedContent(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        personalizedContent,
        message: "Personalized content fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching personalized content:", error);

      res.status(500).json({
        success: false,
        personalizedContent: [],
        message: `Failed to fetch personalized content for user ${userId}, error: ${error.message}`,
      });
    }
  }

  static async getRelatedContentCreators(req: Request, res: Response) {
    console.log("Fetching Related Content Creators...");
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    try {
      console.log(`Getting related content creators for user: ${userId}`);
      const relatedCreators = await ContentService.getRelatedContentCreators(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        relatedCreators,
        message: "Related content creators fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching related content creators:", error);

      res.status(500).json({
        success: false,
        relatedCreators: [],
        message: `Failed to fetch related content creators for user ${userId}, error: ${error.message}`,
      });
    }
  }

  static async getRelatedContent(req: Request, res: Response) {
    console.log("Fetching Related Content...");
    const { contentId } = req.params;
    const userId = (req.query.userId as string) || undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    try {
      console.log(`Getting related content for content ID: ${contentId}`);
      const relatedContent = await ContentService.getRelatedContent(
        contentId,
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        relatedContent,
        message: "Related content fetched successfully",
      });
    } catch (error: any) {
      console.error("Error fetching related content:", error);

      res.status(500).json({
        success: false,
        relatedContent: [],
        message: `Failed to fetch related content for content ID ${contentId}, error: ${error.message}`,
      });
    }
  }
}
