export type searchType = "users" | "content" | "all";

// User record from the database
export interface User {
  user_id: string;
  username: string;
  profile_image?: string;
}

// Content record from the database
export interface Content {
  content_id: string;
  creator_id: string; // Changed from author_id
  title: string;
  summary?: string; // Changed from body_preview
  date_created: Date; // Changed from created_at
}

// API response from the service
export interface SearchResponse {
  users: User[];
  content: Content[];
}