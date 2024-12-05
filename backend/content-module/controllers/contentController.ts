// src/modules/user/controllers/userController.ts
import { Request, Response } from "express";
import { ContentService } from "../services/serviceContent";
import { IncomingForm } from "formidable";
import { StorageService } from "../../storage-module/services/serviceStorage";
import axios from "axios";

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
    console.log(req.body)
    console.log(req.params)
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
    const {contentId, userId} = req.params
    const {data} = req.body

    console.log("edit body: ", req.body)
    console.log(data)

    try {

      // const confirmation = await axios.get(`${apiURL}/content/${contentId}`)
      const confirmation = await ContentService.getContent(contentId)
      const owner_id = confirmation.creatorUID
      console.log(owner_id)
      console.log(userId)
      console.log(confirmation)
      if (userId == owner_id){ //check whether they are allowed to edit the content
        const response = await ContentService.editContent(contentId, data);
        res.status(200).json(response);
      } else{
        throw Error("You do not have this permission.")
      }
    } catch (error) {
      console.log(error);
      res
          .status(500)
          .json({ error: error.message || "Failed to edit content" });
    }
  }

  static async editContentAndThumbnail(req: Request, res: Response) {
    console.log("Editing Content and Thumbnail...");
    const {contentId, userId} = req.params
    console.log("Content ID: ", contentId)
    console.log("User ID: ", userId)

    try {
      const confirmation = await ContentService.getContent(contentId)
      const owner_id = confirmation.creatorUID
      console.log(owner_id)
      console.log(userId)
      console.log(confirmation)
      if (userId == owner_id){ //check whether they are allowed to edit the content
        console.log("User is authorized to edit")
        const file_path = decodeURIComponent(confirmation.thumbnail.split('/o/')[1].split('?')[0]);
        // const ref = file_path.split("/")[0]
        const file_name = file_path.split("/")[1]
        // console.log("data: ", data)
        // console.log("file: ", file)
        // console.log("file_name: ", file_name)
        // console.log("ref: ", ref)
        // console.log("file_type: ", file_type)
        // const thumbnailResponse = StorageService.uploadFile(file, ref, file_name, file_type)
        // console.log("Request: ", req)
        console.log("Form is being created:...")
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form: ", err);
            return res.status(500).json({ error: "Failed to upload thumbnail." });
          }
          // console.log("Logging form stuff...")
          // console.log("backend fields: ", fields)
          // console.log("backend files: ",files)
          // console.log("file_name: ", file_name)
          const file = files.thumbnail[0];
          // console.log()
          const updateData = JSON.parse(fields.data)
          await ContentService.editContent(contentId, updateData);
          let fileName;
          if (file_name){
            fileName = file_name;
          } else {
            fileName = file.newFilename;
          }
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
        } else {
        throw new Error("You do not have permission to edit this post!")
      }
    } catch (error) {
      console.log(error);
      res
          .status(500)
          .json({ error: error.message || "Failed to edit content" });
    }
  }

  static async deleteContent(req: Request, res: Response) {
    console.log("Deleting Content...");
    const { userId, contentId} = req.params;
    try {

      const confirmation = await axios.get(`content/${contentId}`)
      const owner_id = confirmation.data.creatorUID
      if (userId == owner_id) { //check whether they are allowed to delete the content
        // delete actual content, thumbnail, and content from user.content list
        const response = await ContentService.deleteContent(userId, contentId);
        console.log("DELETING CONTENT:::::")
        console.log(response)
        // console.log(userId, contentId)
        res.status(200).json(response);
      } else{
        throw new Error("You don't have the permission to delete this!!")
      }
    } catch (error) {
      console.log(error);
      res
          .status(500)
          .json({ error: error.message || "Failed to delete content" });
    }
  }

  static async deleteContentAndThumbnail(req: Request, res: Response) {
    console.log("Deleting Content...");
    const { userId, contentId, filePath, fileName} = req.params;
    try {
      // delete actual content, thumbnail, and content from user.content list
      const response = await ContentService.deleteContentAndThumbnail(userId, contentId, filePath, fileName);
      console.log("DELETING CONTENT:::::")
      console.log(response)
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res
          .status(500)
          .json({ error: error.message || "Failed to fetch content" });
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
        error: error instanceof Error ? error.message : "Failed to like content",
        stack: error instanceof Error ? error.stack : null
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
        error: error instanceof Error ? error.message : "Failed to unlike content",
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
        error: error instanceof Error ? error.message : "Failed to bookmark content",
      });
    }
  }

  // Unbookmark content
  static async unbookmarkContent(req: Request, res: Response) {
    const { contentId, userId } = req.params;

    try {
      const response = await ContentService.unbookmarkContent(contentId, userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error unbookmarking content:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to unbookmark content",
      });
    }
  }
}