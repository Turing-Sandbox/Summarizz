export interface Content {
  uid: string; // Firebase UID
  creatorUID: string; // Content Creator UID
  title: string; // Content Title
  content: string; // Content Body
  dateCreated: Date; // Date Created
  dateUpdated: Date; // Date Updated

  // Optional Fields
  thumbnail?: string; // Thumbnail Image
  summary?: string; // Content Summary
  readtime?: number; // Read Time
  likes?: number; // Likes Count
  peopleWhoLiked?: string[]; // List of user IDs who liked the post
  bookmarkedBy?: string[]; // List of user IDs who bookmarked the post
  views?: number; // Amount of times this page was viewed. This gets populated and updated with each GET request to the content id.
  shares?: number; // Amount of times shared. This gets populated after someone clicks the share icon button.
}
