export interface Content {
  id: string;
  creatorUID: string;
  dateCreated: Date | null;
  dateUpdated: Date | null;
  title: string;
  content: string;
  thumbnail?: string;
  readtime?: number;
  likes?: number;
  titleLower?: string;
  views?: number;
  shares?: number;
  peopleWhoLiked?: string[];
  bookmarkedBy?: string[];
  sharedBy?: string[];
}
