import axios from "axios";
import { apiURL } from "../scripts/api";

/*
 * ImageService.ts
 * This service handles image preparation for upload, including resizing and compressing images.
 * It ensures that images meet the application's requirements for file type and size.
 */
export class ImageService {
  /*
   * uploadThumbnail() -> Promise<{ url: string } | Error>
   *
   * Uploads a thumbnail image after preparing it (resizing and compressing).
   *
   * @param thumbnail - The image file to be uploaded as a thumbnail.
   * @returns A Promise that resolves to the URL of the uploaded thumbnail or an Error.
   */
  public static async uploadThumbnail(
    thumbnail: File
  ): Promise<{ url: string } | Error> {
    try {
      const preparedFile = await ImageService.prepareImageForUpload(thumbnail);
      const formData = new FormData();
      formData.append("thumbnail", preparedFile);
      const response = await axios.post(
        `${apiURL}/content/uploadThumbnail`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to upload thumbnail";

      return new Error(message);
    }
  }

  /*
   * Prepares an image file for upload by resizing and compressing it.
   *
   * @param file - The image file to be prepared.
   * @returns A Promise that resolves to the prepared File object.
   * @throws Error if the file type is unsupported or exceeds size limits.
   */
  private static async prepareImageForUpload(file: File): Promise<File> {
    // Resizing max dimensions to 1280x1280 pixels - Quality set to 0.8 by default
    const resizedFile = await ImageService.resizeImage(file, 1280, 1280);

    // Confirm the file type and size within the application limits
    if (!ImageService.isValidFileType(resizedFile)) {
      throw new Error("Unsupported file type.");
    }

    // 5MB limit
    if (!ImageService.isValidFileSize(resizedFile, 5 * 1024 * 1024)) {
      throw new Error("File size exceeds limit.");
    }

    return resizedFile;
  }

  /*
   * Resizes an image file to fit within specified maximum dimensions.
   *
   * @param file - The image file to be resized.
   * @param maxWidth - The maximum width of the resized image.
   * @param maxHeight - The maximum height of the resized image.
   * @returns A Promise that resolves to the resized File object.
   */
  private static resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // 1 - Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        // 2 - Create a canvas to draw the resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available"));
        ctx.drawImage(img, 0, 0, width, height);

        // 3 - Convert canvas to Blob and create a new File object
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Image resizing failed"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = url;
    });
  }

  /*
   * Validates the file type against allowed image types.
   *
   * @param file - The image file to validate.
   * @returns True if the file type is valid, false otherwise.
   */
  private static isValidFileType(file: File): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    return allowedTypes.includes(file.type);
  }

  /*
   * Validates the file size against the maximum allowed size.
   *
   * @param file - The image file to validate.
   * @param maxSize - The maximum allowed file size in bytes.
   * @returns True if the file size is within limits, false otherwise.
   */
  private static isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}
