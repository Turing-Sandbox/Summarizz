export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  uid: string;
  bio?: string;
  profilePicture?: string;
  content?: string[];
}
