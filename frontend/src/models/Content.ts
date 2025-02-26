export interface Content {
  id: string;
  creatorUID: string;
  dateCreated: Date;
  dateUpdated: Date;
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
}
