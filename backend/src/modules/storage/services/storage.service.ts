import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "../../../shared/utils/logger";
import fs from "fs/promises";
import path from "path";

// Validate required environment variables at startup
const requiredEnv = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
];

const isDev = process.env.NODE_ENV === "development";
const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), "local_uploads");

const s3Config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

const s3 = new S3Client(s3Config);
const BUCKET = process.env.AWS_S3_BUCKET!;

for (const envVar of requiredEnv) {
  if (!process.env[envVar] && !isDev) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * StorageService handles file uploads and deletions.
 * It supports both local development and production S3 storage.
 *
 * @description In development mode, files are managed locally in the "local_uploads" directory.
 * In production, files are managed in an S3 bucket.
 *
 * @module StorageService
 */
export class StorageService {
  /**
   * Uploads a file to the appropriate storage based on the environment.
   *
   * @param file - The file to upload
   * @param filePath - The path where the file should be stored
   * @param fileName - The name of the file
   * @param fileType - The MIME type of the file (required for S3)
   * @returns An object containing the URL of the uploaded file
   */
  static async uploadFile(
    file: File,
    filePath: string,
    fileName: string,
    fileType: string
  ): Promise<{ url: string }> {
    if (isDev) {
      return await StorageService.uploadFileDevelopment(
        file,
        filePath,
        fileName,
        fileType
      );
    } else {
      return await StorageService.uploadFileProduction(
        file,
        filePath,
        fileName,
        fileType
      );
    }
  }

  /**
   * Uploads a file to local storage in development mode.
   *
   * @param file - The file to upload
   * @param filePath - The path where the file should be stored
   * @param fileName - The name of the file
   * @returns An object containing the URL of the uploaded file
   */
  private static async uploadFileDevelopment(
    file: any,
    filePath: string,
    fileName: string,
    fileType: string
  ): Promise<{ url: string }> {
    try {
      const dir = path.join(LOCAL_UPLOAD_DIR, filePath);
      await fs.mkdir(dir, { recursive: true });

      let fileBuffer: Buffer;

      if (file.filepath) {
        fileBuffer = await fs.readFile(file.filepath);
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else {
        throw new Error("No valid file data found (no filepath or buffer).");
      }

      fileName = `${fileName}${fileType ? `.${fileType.split("/")[1]}` : ""}`;

      const fullPath = path.join(dir, fileName);
      await fs.writeFile(fullPath, fileBuffer);
      logger.info(`File saved locally at ${fullPath}`);

      // Return the absolute file system path
      return { url: fullPath };
    } catch (error: any) {
      logger.error("Local upload error:", error);
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  /**
   * Uploads a file to S3 in production mode.
   *
   * @param file - The file to upload
   * @param filePath - The path where the file should be stored in S3
   * @param fileName - The name of the file
   * @param fileType - The MIME type of the file
   * @returns An object containing the URL of the uploaded file
   */
  private static async uploadFileProduction(
    file: File,
    filePath: string,
    fileName: string,
    fileType: string
  ): Promise<{ url: string }> {
    try {
      const fileBuffer = await fs.readFile(file.webkitRelativePath);
      const key = path.posix.join(filePath, fileName);

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: fileType,
        })
      );

      // Generate a signed GET URL for the uploaded file
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: BUCKET,
          Key: key,
        }),
        { expiresIn: 3600 }
      );

      return { url };
    } catch (error: any) {
      logger.error("S3 upload error:", error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Deletes a file from the appropriate storage based on the environment.
   *
   * @param filePath - The path of the file to delete
   * @throws Error if the file path is not provided or if deletion fails
   */
  static async deleteFile(filePath: string) {
    if (!filePath) throw new Error("File path is required.");

    if (isDev) {
      await StorageService.deleteFileDevelopment(filePath);
    } else {
      await StorageService.deleteFileProduction(filePath);
    }
  }

  /**
   * Deletes a file from local storage in development mode.
   *
   * @param filePath - The path of the file to delete
   * @throws Error if deletion fails
   */
  private static async deleteFileDevelopment(filePath: string) {
    try {
      let localPath = filePath;
      if (localPath.startsWith("/local_uploads/")) {
        localPath = localPath.replace("/local_uploads/", "");
      }
      const fullPath = path.join(LOCAL_UPLOAD_DIR, localPath);

      await fs.unlink(fullPath);
      logger.info(`Local file ${fullPath} deleted.`);
    } catch (error: any) {
      logger.error(`Error deleting local file: `, error);
      throw new Error(`Local delete failed: ${error.message}`);
    }
  }

  /**
   * Deletes a file from S3 in production mode.
   *
   * @param filePath - The path of the file to delete
   * @throws Error if deletion fails
   */
  private static async deleteFileProduction(filePath: string) {
    let key = filePath;
    if (filePath.startsWith("http")) {
      key = StorageService.extractFilePathFromUrl(filePath);
    }
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: key,
        })
      );
      logger.info(`File ${key} deleted from S3.`);
    } catch (error: any) {
      logger.error(`Error deleting file ${key}: `, error);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  /**
   * Extracts the file path from a given S3 URL.
   *
   * @param url - The S3 URL to extract the file path from
   * @returns The extracted file path
   * @throws Error if the URL is invalid
   */
  static extractFilePathFromUrl(url: string): string {
    try {
      // Try to parse using URL API
      const u = new URL(url);
      // Remove leading slash from pathname
      return u.pathname.replace(/^\/+/, "");
    } catch {
      throw new Error("Invalid S3 URL");
    }
  }
}
