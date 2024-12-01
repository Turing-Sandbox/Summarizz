import { db } from "../../shared/firebaseConfig";
import { collection, addDoc, getDoc, updateDoc, arrayRemove, arrayUnion, doc } from "firebase/firestore";
import { addContentToUser, addLikedContentToUser, removeLikedContentFromUser } from "../../user-module/services/userService";
import { increment, update } from "firebase/database";

export class ContentService {
  static async createContent(
    creatorUID: string,
    title: string,
    content: string,
    thumbnail: string | null
  ) {
    try {
      console.log("Creating content...");

      const readtime = await this.estimateReadTime(content);

      console.log("Readtime: ", readtime);

      // Build the content object
      const newContent = {
        creatorUID,
        title,
        content,
        thumbnail: thumbnail || null,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        readtime,
        likes: 0,
        peopleWhoLiked: []
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

  static async estimateReadTime(content: string) {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Like content
  static async likeContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);
  
      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }
  
      const contentData = contentDoc.data();
      const peopleWhoLiked = contentData?.peopleWhoLiked || []; // Ensure we initialize as an empty array if undefined
  
      // Check if the user has already liked the content
      if (peopleWhoLiked.includes(userId)) {
        throw new Error("You have already liked this content");
      }
  
      // Update the likes count and add the user to the peopleWhoLiked list
      await updateDoc(contentRef, {
        likes: (contentData?.likes ?? 0) + 1, // Increment likes
        peopleWhoLiked: arrayUnion(userId),  // Add user to the list of people who liked
      });
      
      // Add this content to the user's liked content list
      await addLikedContentToUser(userId, contentID);
  
      // Fetch the updated document and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = {
        ...contentData,
        likes: typeof contentData.likes === 'number' ? contentData.likes + 1 : 1, // Ensure likes is always a number
        peopleWhoLiked: [...contentData.peopleWhoLiked, userId],
      }; 
  
      return { content: updatedContent }; // Return updated content
      
    } catch (error) {
      console.error("Error liking content:", error);
      throw new Error(error.message || "Failed to like content");
    }
  }

  // Unlike content
  static async unlikeContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();

      // Check if user has already liked the content
      if (!contentData?.peopleWhoLiked?.includes(userId)) {
        throw new Error("You haven't liked this content yet.");
      }

      // Update the likes count and remove the user from the peopleWhoLiked list
      await updateDoc(contentRef, {
        likes: increment(-1),
        peopleWhoLiked: arrayRemove(userId),
      });

      // Remove this content from the user's liked content list
      await removeLikedContentFromUser(userId, contentID);
    
       // Fetch the updated content and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: { ...updatedContent, id: contentID } }; // Return updated content with id

    } catch (error) {
      console.error("Error unliking content:", error);
      throw new Error(error.message || "Failed to unlike content");
    }
  }
}
