import axios from "axios";
import { apiURL } from "../scripts/api";
import { Comment } from "../models/Comment";

export default class CommentService {
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

  static async deleteComment(
    commentId: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.delete(`${apiURL}/comment/${commentId}`, {
        withCredentials: true,
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to delete comment";

      return new Error(message);
    }
  }

  static async updateComment(
    commentId: string,
    commentText: string
  ): Promise<{ message: string } | Error> {
    try {
      const response = await axios.put(
        `${apiURL}/comment/${commentId}`,
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

  static async getComment(commentId: string): Promise<Comment | Error> {
    try {
      const response = await axios.get(`${apiURL}/comment/${commentId}`, {
        withCredentials: true,
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to get comment";

      return new Error(message);
    }
  }
}
