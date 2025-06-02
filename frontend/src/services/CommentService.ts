import axios from "axios";
import { apiURL } from "../scripts/api";
import { Comment } from "../models/Comment";

/**
 * CommentService class
 *
 * @description
 * This class provides methods for managing comments, including publishing,
 * fetching, updating, and deleting comments.
 */
export default class CommentService {
  /**
   * publishComment() -> Promise<{ message: string; comment: Comment } | Error>
   * 
   * Publishes a comment for a specific content ID.
   *
   * @param contentId - The ID of the content to comment on.
   * @param commentText - The text of the comment.
   * @param ownerId - The ID of the user who owns the comment.
   * @returns A promise that resolves to a success message and the created comment or an error.
   */
  static async publishComment(
    contentId: string,
    commentText: string,
    ownerId: string
  ): Promise<{ message: string; comment: Comment } | Error> {
    try {
      const response = await axios.post(
        `${apiURL}/comment/${contentId}`,
        {
          text: commentText,
          ownerId: ownerId,
        },
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to publish comment";

      return new Error(message);
    }
  }

  /**
   * getPostComments() -> Promise<Comment[] | Error>
   * 
   * Fetches all comments for a specific content ID.
   *
   * @param contentId - The ID of the content to fetch comments for.
   * @returns A promise that resolves to an array of comments or an error.
   */
  static async getPostComments(contentId: string): Promise<Comment[] | Error> {
    try {
      const response = await axios.get(
        `${apiURL}/comment/content/${contentId}`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get comments";

      return new Error(message);
    }
  }

  /**
   * getComment() -> Promise<Comment | Error>
   * 
   * Fetches a specific comment by its ID and the content ID it belongs to.
   *
   * @param commentId - The ID of the comment to fetch.
   * @param contentId - The ID of the content the comment belongs to.
   * @returns A promise that resolves to the comment or an error.
   */
  static async getComment(
    commentId: string,
    contentId: string
  ): Promise<Comment | Error> {
    try {
      const response = await axios.get(
        `${apiURL}/comment/${commentId}/content/${contentId}`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get comment";

      return new Error(message);
    }
  }

  /**
   * updateComment() -> Promise<{ message: string } | Error>
   * 
   * Updates a comment by its ID and the content ID it belongs to.
   *
   * @param commentId - The ID of the comment to update.
   * @param commentText - The new text for the comment.
   * @param contentId - The ID of the content the comment belongs to.
   * @returns A promise that resolves to a success message or an error.
   */
  static async updateComment(
    commentId: string,
    commentText: string,
    contentId: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.put(
        `${apiURL}/comment/${commentId}/content/${contentId}`,
        { text: commentText },
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to update comment";

      return new Error(message);
    }
  }

  /**
   * deleteComment() -> Promise<{ message: string } | Error>
   * 
   * Deletes a comment by its ID and the content ID it belongs to.
   *
   * @param commentId - The ID of the comment to delete.
   * @param contentId - The ID of the content the comment belongs to.
   * @returns A promise that resolves to a success message or an error.
   */
  static async deleteComment(
    commentId: string,
    contentId: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.delete(
        `${apiURL}/comment/${commentId}/content/${contentId}`,
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to delete comment";

      return new Error(message);
    }
  }
}
