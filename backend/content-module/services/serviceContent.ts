import { db } from "../../shared/firebaseConfig";
import {
  collection,
  increment,
  addDoc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  doc,
  deleteDoc,
  runTransaction,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import {
  addContentToUser,
  removeContentFromUser,
  addLikedContentToUser,
  removeLikedContentFromUser,
  addBookmarkedContentToUser,
  removeBookmarkedContentFromUser,
} from "../../user-module/services/userService";
import { StorageService } from "../../storage-module/services/serviceStorage";
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

      const readtime = await ContentService.estimateReadTime(content);

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
        titleLower: title.toLowerCase(),
        sharedBy: [],
      };

      const docRef = await addDoc(collection(db, "contents"), newContent);
      console.log("Content created with ID:", docRef.id);

      // Update the document with its own ID as uid
      await updateDoc(docRef, { uid: docRef.id });

      addContentToUser(creatorUID, docRef.id);

      return { uid: docRef.id };
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
    console.log(uid);
    const contentDoc = await getDoc(doc(db, "contents", uid));

    if (!contentDoc.exists()) {
      return null;
    }

    return contentDoc.data() as Content;
  }

  static async deleteContent(content_id: string) {
    console.log("Deleting content...");

    try {
      // 1- Get Content
      const contentRef = doc(db, "contents", content_id);
      const contentDoc = await getDoc(contentRef);
      const contentData = contentDoc.data() as Content;

      // 2- Delete thumbnail
      const thumbnail = contentData?.thumbnail;
      if (thumbnail) {
        await StorageService.deleteFile(thumbnail);
      }

      // 3- Delete actual content
      await deleteDoc(doc(db, "contents", content_id));

      // 4- Remove content from user list
      await removeContentFromUser(contentData.creatorUID, content_id);
    } catch (error) {
      console.error("Error! ", error);
      throw new Error(error);
    }
    return "Successfully deleted!";
  }

  static async editContent(content_id: string, data: Partial<Content>) {
    console.log("Editing content...");
    console.log(content_id);
    console.log(data);
    data.titleLower = data.title.toLowerCase();
    console.log(data.titleLower);
    console.log(data);
    try {
      await updateDoc(doc(db, `contents/${content_id}`), data);
      console.log("EDIT^^^^^^^^^^^^^^^^^EDIT");
    } catch (error) {
      console.error("Error while editing content! ", error);
      throw new Error(error);
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
        peopleWhoLiked: arrayUnion(userId), // Add user to the list of people who liked
      });

      // Add this content to the user's liked content list
      await addLikedContentToUser(userId, contentID);

      // Fetch the updated document and return it
      const updatedContent = {
        ...contentData,
        likes:
          typeof contentData.likes === "number" ? contentData.likes + 1 : 1, // Ensure likes is always a number
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
        // Step 1: Read all required documents first.
        const contentDoc = await transaction.get(contentRef);
        const userDoc = await transaction.get(userRef);

        if (!contentDoc.exists()) {
          throw new Error("Content not found");
        }
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }

        const contentData = contentDoc.data() as Content;

        // Step 2: Compute new values.
        const currentShares = contentData.shares || 0;
        const sharedBy = contentData.sharedBy || [];

        let newSharedBy: string[];
        let updatedShares: number;

        if (!sharedBy.includes(userId)) {
          // If the user hasn't shared yet, add them and increment.
          newSharedBy = [...sharedBy, userId];
          updatedShares = currentShares + 1;
          // Write updates for content document.
          transaction.update(contentRef, {
            sharedBy: newSharedBy,
            shares: updatedShares,
          });
          // Also update the user's sharedContent field.
          transaction.update(userRef, {
            sharedContent: arrayUnion(contentID),
          });
        } else {
          // The user has already shared—do not change anything.
          newSharedBy = sharedBy;
          updatedShares = currentShares;
        }

        // Step 3: Construct the updated data manually (without re-reading).
        const updatedData = {
          ...contentData,
          sharedBy: newSharedBy,
          shares: updatedShares,
        } as Content;

        // Normalize date fields.
        if (updatedData.dateCreated) {
          if (updatedData.dateCreated instanceof Timestamp) {
            updatedData.dateCreated = updatedData.dateCreated.toDate();
          } else if (typeof updatedData.dateCreated === "string") {
            updatedData.dateCreated = new Date(updatedData.dateCreated);
          }
        }
        if (updatedData.dateUpdated) {
          if (updatedData.dateUpdated instanceof Timestamp) {
            updatedData.dateUpdated = updatedData.dateUpdated.toDate();
          } else if (typeof updatedData.dateUpdated === "string") {
            updatedData.dateUpdated = new Date(updatedData.dateUpdated);
          }
        }

        return updatedData;
      });

      return { content: updatedContent };
    } catch (error) {
      console.error("Error sharing content:", error);
      throw new Error(error.message || "Failed to share content");
    }
  }

  // Unshare content
  static async unshareContent(contentID: string, userId: string) {
    try {
      const contentRef = doc(db, "contents", contentID);
      const userRef = doc(db, "users", userId);

      const updatedContent = await runTransaction(db, async (transaction) => {
        // Read both documents.
        const contentDoc = await transaction.get(contentRef);
        const userDoc = await transaction.get(userRef);

        if (!contentDoc.exists()) {
          throw new Error("Content not found");
        }
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }

        const contentData = contentDoc.data() as Content;
        const sharedBy = contentData.sharedBy || [];
        const currentShares = contentData.shares || 0;

        let newSharedBy: string[];
        let updatedShares: number;

        if (sharedBy.includes(userId)) {
          // Remove the user from sharedBy and decrement share count.
          newSharedBy = sharedBy.filter((id) => id !== userId);
          updatedShares = currentShares > 0 ? currentShares - 1 : 0;
          transaction.update(contentRef, {
            sharedBy: newSharedBy,
            shares: updatedShares,
          });
          // Also remove the content from user's sharedContent.
          transaction.update(userRef, {
            sharedContent: arrayRemove(contentID),
          });
        } else {
          // If the user hadn't shared, nothing changes.
          newSharedBy = sharedBy;
          updatedShares = currentShares;
        }

        const updatedData = {
          ...contentData,
          sharedBy: newSharedBy,
          shares: updatedShares,
        } as Content;

        // Normalize date fields.
        if (updatedData.dateCreated) {
          if (updatedData.dateCreated instanceof Timestamp) {
            updatedData.dateCreated = updatedData.dateCreated.toDate();
          } else if (typeof updatedData.dateCreated === "string") {
            updatedData.dateCreated = new Date(updatedData.dateCreated);
          }
        }
        if (updatedData.dateUpdated) {
          if (updatedData.dateUpdated instanceof Timestamp) {
            updatedData.dateUpdated = updatedData.dateUpdated.toDate();
          } else if (typeof updatedData.dateUpdated === "string") {
            updatedData.dateUpdated = new Date(updatedData.dateUpdated);
          }
        }

        return updatedData;
      });

      return { content: updatedContent };
    } catch (error) {
      console.error("Error unsharing content:", error);
      throw new Error(error.message || "Failed to unshare content");
    }
  }

  // Get all content from the database from every user
  static async getAllContent(limit = 20) {
    console.log("Getting all content...");

    try {
      const contentCollection = collection(db, "contents");
      const contentSnapshot = await getDocs(contentCollection);
      const contentList = contentSnapshot.docs.map(
        (doc) => doc.data() as Content
      );

      return contentList.slice(0, limit) as Content[];
    } catch (error) {
      console.error("Error fetching all content: ", error);
      throw new Error(error.message || "Failed to fetch all content");
    }
  }

  // Get all trending content
  static async getTrendingContent(limit = 10) {
    console.log("Getting trending content...");

    try {
      const allContent = await ContentService.getAllContent();

      // Sorts by likes in descending order (trending content is highest liked)
      const trendingContent = [...allContent]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, limit);

      return trendingContent as Content[];
    } catch (error) {
      console.error("Error fetching trending content: ", error);
      throw new Error(error.message || "Failed to fetch trending content");
    }
  }

  // Get personalized content (for users)
  static async getPersonalizedContent(userId: string, limit = 20) {
    console.log("Getting personalized content for user:", userId);
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const likedContent = userData.likedContent || [];
      const following = userData.following || [];

      const allContent = await ContentService.getAllContent();

      // Extract scoring logic to separate methods for better maintainability
      const scoredContent = allContent.map((content) => {
        // Calculate different types of scores
        const creatorScore = ContentService.calculateCreatorScore(
          content,
          following
        );
        const similarityScore = ContentService.calculateSimilarityScore(
          content,
          likedContent,
          allContent
        );
        const popularityScore =
          ContentService.calculatePopularityScore(content);
        const recencyScore = ContentService.calculateRecencyScore(content);

        // Combine all scores
        const score =
          creatorScore + similarityScore + popularityScore + recencyScore;

        return { ...content, score };
      });

      let personalizedContent = scoredContent
        .filter((content) => content.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (personalizedContent.length < 5) {
        console.log("Not enough personalized content, adding trending content");
        const trendingContent = await ContentService.getTrendingContent(10);

        const existingUids = personalizedContent.map(
          (c) => (c as Content & { score: number }).uid
        );
        const additionalContent = trendingContent
          .filter((c) => !existingUids.includes(c.uid))
          .map((content) => ({
            ...content,
            score: 3,
          }));

        personalizedContent = [
          ...personalizedContent,
          ...additionalContent,
        ].slice(0, limit);
      }

      return personalizedContent as Content[];
    } catch (error) {
      console.error("Error fetching personalized content: ", error);
      throw new Error(error.message || "Failed to fetch personalized content");
    }
  }

  // Helper methods for calculating different score components
  private static calculateCreatorScore(
    content: any,
    following: string[]
  ): number {
    // Score++ if creator is followed by user
    return following.includes(content.creatorUID) ? 10 : 0;
  }

  private static calculateSimilarityScore(
    content: any,
    likedContent: string[],
    allContent: any[]
  ): number {
    // If user has liked this content, we'll consider it but with consistent scoring
    if (likedContent.includes(content.uid)) {
      return 5; // Always give a positive score for content similar to what user liked
    }

    // Otherwise, check for similarity with other liked content
    let similarityScore = 0;
    for (const likedId of likedContent) {
      const likedItem = allContent.find((item) => item.id === likedId);
      if (likedItem?.titleLower && content.titleLower) {
        const likedWords = likedItem.titleLower.split(" ");
        const contentWords = content.titleLower.split(" ");

        const matchingWords = likedWords.filter(
          (word: string) => word.length > 3 && contentWords.includes(word)
        ).length;

        if (matchingWords > 0) {
          similarityScore += matchingWords * 2;
        }
      }
    }
    return similarityScore;
  }

  private static calculatePopularityScore(content: any): number {
    // Score++ for likes and views
    return (content.likes || 0) * 0.2 + (content.views || 0) * 0.1;
  }

  private static calculateRecencyScore(content: any): number {
    if (!content.dateCreated) return 0;

    const now = new Date();
    const contentDate =
      content.dateCreated instanceof Date
        ? content.dateCreated
        : new Date(content.dateCreated);

    const daysDiff = Math.floor(
      (now.getTime() - contentDate.getTime()) / (1000 * 3600 * 24)
    );

    // Give higher scores to newer content (less than 7 days old)
    return daysDiff < 7 ? (7 - daysDiff) * 0.5 : 0;
  }

  // Get related content creators based on user's likes and follows
  static async getRelatedContentCreators(userId: string, limit = 5) {
    console.log("Getting related content creators for user:", userId);
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const likedContent = userData.likedContent || [];
      const following = userData.following || [];

      console.log("User liked content:", likedContent);
      console.log("User following:", following);

      // If the user hasn't liked any content, get trending content creators instead
      if (likedContent.length === 0) {
        console.log("No liked content, getting trending creators instead");
        const trendingContent = await ContentService.getTrendingContent(20);
        const trendingCreators = trendingContent
          .map((content) => content.creatorUID)
          .filter(
            (uid, index, self) =>
              // Remove duplicates and exclude the user and those they already follow
              self.indexOf(uid) === index &&
              uid !== userId &&
              !following.includes(uid)
          )
          .slice(0, limit);

        console.log("Trending creators:", trendingCreators);
        return trendingCreators;
      }

      // Get all content that the user has liked
      const likedContentDetails = await Promise.all(
        likedContent.map(async (contentId) => {
          return await ContentService.getContent(contentId);
        })
      );

      console.log("Liked content details:", likedContentDetails);

      // Extract creator UIDs from liked content
      const creatorUids = likedContentDetails
        .filter((content) => content !== null)
        .map((content) => content.creatorUID)
        .filter((uid) => !following.includes(uid) && uid !== userId); // Exclude already followed creators and self

      console.log("Creator UIDs from liked content:", creatorUids);

      // If no creators found from liked content, get trending creators
      if (creatorUids.length === 0) {
        console.log(
          "No creators from liked content, getting trending creators"
        );
        const trendingContent = await ContentService.getTrendingContent(20);
        const trendingCreators = trendingContent
          .map((content) => content.creatorUID)
          .filter(
            (uid, index, self) =>
              self.indexOf(uid) === index &&
              uid !== userId &&
              !following.includes(uid)
          )
          .slice(0, limit);

        console.log("Trending creators:", trendingCreators);
        return trendingCreators;
      }

      // Count occurrences of each creator to find most relevant ones
      const creatorCounts = creatorUids.reduce((acc, uid) => {
        acc[uid] = (acc[uid] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log("Creator counts:", creatorCounts);

      // Sort creators by frequency and take top ones
      const sortedCreators = Object.entries(creatorCounts)
        .sort(
          ([, countA], [, countB]) => (countB as number) - (countA as number)
        )
        .slice(0, limit)
        .map(([uid]) => uid);

      console.log("Sorted creators:", sortedCreators);
      return sortedCreators;
    } catch (error) {
      console.error("Error fetching related content creators: ", error);
      throw new Error(
        error.message || "Failed to fetch related content creators"
      );
    }
  }

  static async getRelatedContent(
    contentId: string,
    userId: string = null,
    limit = 5
  ) {
    console.log("Getting related content for content ID:", contentId);
    try {
      const sourceContent = await ContentService.getContent(contentId);
      if (!sourceContent) {
        throw new Error("Content not found");
      }

      console.log("Source content:", sourceContent.title);

      const allContent = await ContentService.getAllContent();
      console.log("Total content count:", allContent.length);

      const otherContent = allContent.filter(
        (content) => content.uid !== contentId
      );
      console.log("Other content count:", otherContent.length);

      const scoredContent = otherContent.map((content) => {
        let titleSimilarity = 0;
        if (sourceContent.titleLower && content.titleLower) {
          const sourceWords = sourceContent.titleLower.split(" ");
          const contentWords = content.titleLower.split(" ");

          const matchingWords = sourceWords.filter(
            (word) => word.length > 3 && contentWords.includes(word)
          ).length;

          titleSimilarity = matchingWords * 3;
        }

        const creatorBonus =
          content.creatorUID === sourceContent.creatorUID ? 5 : 0;
        const popularityScore =
          (content.likes || 0) * 0.2 + (content.views || 0) * 0.1;

        let userScore = 0;
        if (userId) {
          // This would ideally check if the user has liked similar content,
          // For now, we'll just use a placeholder that can be enhanced later
          userScore = 0;
        }

        const totalScore =
          titleSimilarity + creatorBonus + popularityScore + userScore;
        return { ...content, score: totalScore };
      });

      let relatedContent = scoredContent
        .filter((content) => content.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(
        "Related content with score > 0 count:",
        relatedContent.length
      );

      // If we don't have enough related content, include some trending content
      if (relatedContent.length < limit) {
        console.log("Not enough related content, adding trending content");
        const trendingContent = await ContentService.getTrendingContent(
          limit * 2
        );

        // Filter out content that's already in relatedContent and the source content
        const additionalContent = trendingContent
          .filter(
            (content) =>
              content.uid !== contentId &&
              !relatedContent.some((rc) => rc.uid === content.uid)
          )
          .map((content) => ({ ...content, score: 1 })) // Lower score for trending content
          .slice(0, limit - relatedContent.length);

        console.log(
          "Additional trending content count:",
          additionalContent.length
        );
        relatedContent = [...relatedContent, ...additionalContent];
      }

      console.log("Final related content count:", relatedContent.length);
      return relatedContent;
    } catch (error) {
      console.error("Error fetching related content: ", error);
      throw new Error(error.message || "Failed to fetch related content");
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
        throw new Error("Content not found.");
      }
      const data = contentDoc.data()?.views;
      const views = data || 0;
      // Update the document with the new number of views
      await updateDoc(contentRef, { views: views + 1 });
      return "Successfully incremented view count!";
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
      return "Successfully incremented share count!";
    } catch (error) {
      console.error("Error incrementing the share count: ", error);
      throw error;
    }
  }
}
