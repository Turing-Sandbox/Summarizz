import { db } from "../../shared/firebaseConfig";
import { collection, increment, addDoc, getDoc, updateDoc, arrayRemove, arrayUnion, doc, deleteDoc, runTransaction, Timestamp } from "firebase/firestore";
import {
  addContentToUser,
  removeContentFromUser,
  addLikedContentToUser,
  removeLikedContentFromUser,
  addBookmarkedContentToUser,
  removeBookmarkedContentFromUser,
  addSharedContentToUser,
  removeSharedContentFromUser,
} from "../../user-module/services/userService";
import { StorageService } from "../../storage-module/services/serviceStorage"
import { Content } from "../models/contentModel";

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
        peopleWhoLiked: [],
        bookmarkedBy: [],
        sharedBy: []
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

  static async deleteContentAndThumbnail(user_id: string, content_id: string, filePath: string, fileName: string) {
    console.log("Deleting content (with thumbnail)...");
    // Delete content from Firestore
    console.log(user_id);
    console.log(content_id);
    const file_path = `${filePath}/${fileName}`
    console.log(file_path);

    try {
      // delete actual content
      await deleteDoc(doc(db, "contents", content_id));
      // delete thumbnail
      await StorageService.deleteFile(file_path);
      // delete content from user
      await removeContentFromUser(user_id, content_id);
    } catch (error) {
      console.error("Error! ", error);
      throw new Error(error)
    }
    return "Successfully deleted!";
  }

  static async deleteContent(user_id: string, content_id: string) {
    console.log("Deleting content (without thumbnail)...");
    // Delete content from Firestore
    console.log(user_id);
    console.log(content_id);

    try {
      // delete actual content
      await deleteDoc(doc(db, "contents", content_id));
      // remove content from user list
      await removeContentFromUser(user_id, content_id); // tested. it works
    } catch (error) {
      console.error("Error! ", error);
      throw new Error(error)
    }
    return "Successfully deleted!";
  }

  static async editContent(content_id: string, data: Partial<Content>) {
    console.log("Editing content...")
    console.log(content_id);
    console.log(data);
    try {
      await updateDoc(doc(db, `contents/${content_id}`), data);
      console.log("EDIT^^^^^^^^^^^^^^^^^EDIT")
    } catch (error) {
      console.error("Error while editing content! ", error);
      throw new Error(error)
    }
    return "Successfully edited!";
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

  // Bookmark content
  static async bookmarkContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();
      const bookmarkedBy = contentData?.bookmarkedBy || []; // Ensure it's initialized as an empty array if undefined

      // Check if the user has already bookmarked the content
      if (bookmarkedBy.includes(userId)) {
        throw new Error("You have already bookmarked this content");
      }

      // Update the content document to add the user to the bookmarkedBy list
      await updateDoc(contentRef, {
        bookmarkedBy: arrayUnion(userId),
      });

      // Add this content to the user's bookmarked content list
      await addBookmarkedContentToUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: updatedContent }; // Return updated content with the bookmarkedBy list updated
    } catch (error) {
      console.error("Error bookmarking content:", error);
      throw new Error(error.message || "Failed to bookmark content");
    }
  }

  // Unbookmark content
  static async unbookmarkContent(contentID: string, userId: string) {
    try {
      // Get the content document from Firestore
      const contentRef = doc(db, "contents", contentID);
      const contentDoc = await getDoc(contentRef);

      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }

      const contentData = contentDoc.data();
      const bookmarkedBy = contentData?.bookmarkedBy || [];

      // Check if user has already bookmarked the content
      if (!bookmarkedBy.includes(userId)) {
        throw new Error("You haven't bookmarked this content yet.");
      }

      // Update the content document to remove the user from the bookmarkedBy list
      await updateDoc(contentRef, {
        bookmarkedBy: arrayRemove(userId),
      });

      // Remove this content from the user's bookmarked content list
      await removeBookmarkedContentFromUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContentDoc = await getDoc(contentRef);
      const updatedContent = updatedContentDoc.data();

      return { content: updatedContent }; // Return updated content with the bookmarkedBy list updated
    } catch (error) {
      console.error("Error unbookmarking content:", error);
      throw new Error(error.message || "Failed to unbookmark content");
    }
  }

  // Share content with all updates in a single transaction
static async shareContent(contentID: string, userId: string) {
  try {
      const contentRef = doc(db, "contents", contentID);
      const userRef = doc(db, "users", userId);

      const updatedContent = await runTransaction(db, async (transaction) => {
          // Get the current content document
          const contentDoc = await transaction.get(contentRef);
          if (!contentDoc.exists()) {
              throw new Error("Content not found");
          }
          const contentData = contentDoc.data();

          // 1. Add to sharedBy array (if not already present)
          const sharedBy = contentData.sharedBy || [];
          if (!sharedBy.includes(userId)) {
            transaction.update(contentRef, {
                sharedBy: arrayUnion(userId),
            });
          }

          // 2. Increment the shares count
          const currentShares = contentData.shares || 0;
          transaction.update(contentRef, { shares: currentShares + 1 });

          // 3. Update the user's sharedContent
           transaction.update(userRef, {
                sharedContent: arrayUnion(contentID),
            });

            // 4. Fetch the updated document after transaction writes
           const updatedDoc = await transaction.get(contentRef);
           if (!updatedDoc.exists) {
               throw new Error("Content disappeared during transaction!"); 
           }
           const updatedData = updatedDoc.data();

           // Convert dates to JavaScript Date objects here
           if (updatedData && updatedData.dateCreated) {
             if (updatedData.dateCreated instanceof Timestamp) {
               // Handle Firestore Timestamp correctly
               updatedData.dateCreated = updatedData.dateCreated.toDate();
             } else if (typeof updatedData.dateCreated === 'string') {
                 updatedData.dateCreated = new Date(updatedData.dateCreated);
             } else if (!(updatedData.dateCreated instanceof Date)) {
               updatedData.dateCreated = null; // Or a default date
             }
           }

           if (updatedData && updatedData.dateUpdated) { //ALSO FOR DATE UPDATED
             if (updatedData.dateUpdated instanceof Timestamp) {
               updatedData.dateUpdated = updatedData.dateUpdated.toDate();
             } else if (typeof updatedData.dateUpdated === 'string'){
                 updatedData.dateUpdated = new Date(updatedData.dateUpdated);
             } else if (!(updatedData.dateUpdated instanceof Date)) {
               updatedData.dateUpdated = null;
             }
           }

           return updatedData; // Return the updated data with converted dates
       });

       return { content: updatedContent }; // Return the updated content

  } catch (error) {
      console.error("Error sharing content:", error);
      throw new Error(error.message || "Failed to share content");
  }
}

  // Unshare content
  static async unshareContent(contentID: string, userId: string) {
    try {
       // Get the content document reference
       const contentRef = doc(db, "contents", contentID);

       // Remove this content from the user's shared content list
       await removeSharedContentFromUser(userId, contentID);

       // Fetch the updated document and return it
       const updatedContentDoc = await getDoc(contentRef); 
       const updatedContent = updatedContentDoc.data(); 

       return { content: updatedContent };
    } catch (error) {
       console.error("Error unsharing content:", error);
       throw new Error(error.message || "Failed to unshare content");
    }
  }

  //Increment the number of views on an article
  static async incrementViewCount(contentID: string) {
    try {
      // Get the content reference to update
      const contentRef = doc(db, "contents", contentID);
      // Get the content of the document to increment the views
      const contentDoc = await getDoc(contentRef);
      if (!contentDoc.exists()) {
        throw new Error("Content not found.")
      }
      const data = contentDoc.data()?.views
      const views = data || 0
      // Update the document with the new number of views
      await updateDoc(contentRef, { views: views + 1 })
      return "Successfully incremented view count!"
    } catch (error) {
      console.error("Error incrementing the view count: ", error);
      throw error;
    }

  }

  //Increment the number of recorded shares on an article
  static async incrementShareCount(contentID: string) {
    try {
      // Get the content reference to update
      const contentRef = doc(db, "contents", contentID);
      // Get the content of the document to increment the shares
      const contentDoc = await getDoc(contentRef);
      if (!contentDoc.exists()) {
        throw new Error("Content not found");
      }
      const data = contentDoc.data()?.shares;
      const shares = data || 0;
      // Update the document with the new number of shares
      await updateDoc(contentRef, { shares: shares + 1 });
      return "Successfully incremented share count!"
    } catch (error) {
      console.error("Error incrementing the share count: ", error);
      throw error;
    }
  }
}
