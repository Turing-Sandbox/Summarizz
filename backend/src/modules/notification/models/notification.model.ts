export interface Notification {
  // Notification ID
  notificationId?: string;
  // User ID of the user who triggered the notification
  userId: string;
  // Username of the user who triggered the notification
  username: string;
  // Type of notification (comment, like, share, follow, followedPost, followedShare)
  type:
    | "comment"
    | "like"
    | "share"
    | "follow"
    | "followedPost"
    | "followedShare";
  // Preview text for the notification (Comment/Content preview, just the first 30 or so characters of the
  // title, or comment)
  textPreview?: string;
  // Content ID, may be null if the notification is a follow
  contentId?: string;
  // Comment ID, only not null if the notification is a comment
  commentId?: string;
  // Timestamp of the notification
  timestamp: number;
  // Read status
  read: boolean;
}
