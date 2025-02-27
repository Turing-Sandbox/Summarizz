export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  uid: string;
  bio?: string;
  profileImage?: string;
  content?: string[];
  isPrivate?: boolean;
  followers?: string[];
  following?: string[];
  followRequests?: string[];
}
