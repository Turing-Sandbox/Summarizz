import { db } from "../../shared/firebaseConfig";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
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

  static async getContent(uid: string) {
    console.log("Getting content...");
    // Get content from Firestore
    console.log(uid);
    const contentDoc = await getDoc(doc(db, "contents", uid));
    return contentDoc.exists() ? contentDoc.data() : null;

    // const contentRef = await getDoc(doc(db, "contents", contentID));

    // if (contentRef.exists()) {
    //   const content = contentRef.data();
    //   return content;
    // } else {
    //   return null;
    // }
  }
}
