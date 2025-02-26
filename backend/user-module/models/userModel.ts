export interface User {
  uid: string; // Firebase UID
  firstName: string; // User’s first name
  lastName: string; // User’s last name
  email: string; // User’s email
  username: string; // Display name
  createdAt: Date; // Timestamp
  profileImage?: string; // Optional profile image
  bio?: string; // Optional bio
  phone?: string; // Optional phone number
  dateOfBirth?: string; // Optional date of birth
  location?: string; // Optional location
  website?: string; // Optional website
  content?: string[]; // Optional content
  likedContent?: string[]; // Optional liked content
  bookmarkedContent?: string[]; // Optional bookmarked content
  followedCreators?: string[]; // Optional followed creators
  followedBy?: string[]; // Optional followed by users
  sharedContent?: string[]; // Optional shared content
}
