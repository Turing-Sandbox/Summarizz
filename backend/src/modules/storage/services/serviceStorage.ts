import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../../shared/config/firebase.config";
import { logger } from "../../../shared/loggingHandler";
import fs from "fs/promises";

export class StorageService {
  /**
   * @description Uploads a file to Firebase Storage
   *
   * @param file
   * @param filePath
   * @param fileName
   * @param fileType
   *
   * @returns - Object containing the download URL of the uploaded file
   * @throws - Error if file upload fails
   */
  static async uploadFile(
    file,
    filePath: string,
    fileName: string,
    fileType: string
  ) {
    try {
      console.log("Uploading File...");

      const storageRef = ref(storage, `${filePath}/${fileName}`);
      const metadata = {
        contentType: fileType,
      };
      const fileBuffer = await fs.readFile(file.filepath);

      const snapshot = await uploadBytes(storageRef, fileBuffer, metadata);
      logger.info(`
        File: ${file}
        FileBuffer: ${fileBuffer}
        Path: ${filePath}
        FileName: ${fileName}
        StorageRef: ${storageRef}
      `);
      logger.info("File uploaded successfully.");

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      logger.info("Download URL:", downloadURL);

      return { url: downloadURL };
    } catch (error) {
      let errorMessage = error.message;

      // Remove "Firebase: " prefix from the error message
      if (errorMessage.startsWith("Firebase: ")) {
        errorMessage = errorMessage.replace("Firebase: ", "");
      }
      throw new Error(errorMessage);

    }
  }

  /**
   *
   * @description - Deletes a file from Firebase Storage
   *
   * @param filePath - Path to the file in Firebase Storage (can be a URL)
   * @returns - void
   * @throws - Error if file path is not provided
   */
  static async deleteFile(filePath: string) {
    if (!filePath) {
      throw new Error("File path is required.");
    }

    if (filePath.includes("https://firebasestorage.googleapis.com")) {
      filePath = await StorageService.extractFilePathFromUrl(filePath);
    }

    const fileRef = ref(storage, `${filePath}`);

    try {
      await deleteObject(fileRef);
      logger.info(`File ${filePath} deleted.`);

    } catch (error) {
      logger.error(`Error deleting file ${filePath}: `, error);

    }
  }

  /**
   * Extracts the file path from a Firebase Storage URL.
   *
   * @param url - The full URL of the file in Firebase Storage.
   * @returns The file path to be used with Firebase Storage methods.
   */
  static async extractFilePathFromUrl(url: string): Promise<string> {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.*?)\?/);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error("Invalid Firebase Storage URL");

  }
}
