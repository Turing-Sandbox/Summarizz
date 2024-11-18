import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../shared/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import fs from "fs/promises";
import { addContentToUser } from "../../user-module/services/userService";

export class ContentService {
  static async createContent(
    creatorUID: string,
    title: string,
    content: string,
    thumbnail: string | null
  ) {
    try {
      console.log("Creating content...");
      // Build the content object
      const newContent = {
        creatorUID,
        title,
        content,
        thumbnail: thumbnail || null,
        dateCreated: new Date(),
        dateUpdated: new Date(),
      };

      const docRef = await addDoc(collection(db, "contents"), newContent);
      console.log("Content created with ID:", docRef.id);

      addContentToUser(creatorUID, docRef.id);

      return { id: docRef.id };
    } catch (error) {
      let errorMessage = error.message;
      // Remove "Firebase: " prefix from the error message
      if (errorMessage.startsWith("Firebase: ")) {
        errorMessage = errorMessage.replace("Firebase: ", "");
      }
      throw new Error(errorMessage);
    }
  }

  static async uploadThumbnail(
    file,
    filePath: string,
    fileName: string,
    fileType: string
  ) {
    try {
      console.log("Uploading Thumbnail...");
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
