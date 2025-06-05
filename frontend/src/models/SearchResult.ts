// Models for search results from the backend
// These match the backend search.types.ts structure

export interface SearchUser {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

export interface SearchContent {
  content_id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  title: string;
  summary?: string;
  date_created: Date;
}

export interface SearchResponse {
  users: SearchUser[];
  content: SearchContent[];
}
