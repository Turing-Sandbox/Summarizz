export type searchType = "users" | "content" | "all";

// User record from the database
export interface User {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

// Content record from the database
export interface Content {
  content_id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  title: string;
  summary?: string;
  date_created: Date;
}

// API response from the service
export interface SearchResponse {
  users: User[];
  content: Content[];
}