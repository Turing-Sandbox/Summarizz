interface User {
    uid: string;         // Firebase UID
    email: string;       // User’s email
    username: string;    // Display name
    createdAt: Date;     // Timestamp
    profileImage?: string; // Optional profile image
  }