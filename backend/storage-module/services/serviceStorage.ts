import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../shared/firebaseConfig";
import fs from "fs/promises";

export class StorageService {
  // Upload file to Firebase Storage
  /// @param file - File object
  /// @param filePath - Path to store the file in Firebase Storage
  /// @param fileName - Name of the file
  /// @param fileType - Type of the file
  /// @returns - URL of the uploaded file
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
      console.log("Uploaded file successfully!");

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Download URL:", downloadURL);

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
}
