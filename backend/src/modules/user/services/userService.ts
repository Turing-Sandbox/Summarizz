import { db } from "../../../shared/config/firebase.config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";
import { User } from "../models/userModel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import jwt from "jsonwebtoken";
import { ContentService } from "../../content/services/serviceContent";
import { StorageService } from "../../storage/services/serviceStorage";
import { env } from "../../../shared/config/environment";

// ----------------------------------------------------------
// --------------------- Authentication ---------------------
// ----------------------------------------------------------

export async function register(
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string
) {
  const auth = getAuth();
  try {
    // Register user - Firebase Auth (Email & Password)
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user - Firestore Database (User Data)
    await createUser(user.uid, firstName, lastName, username, email);

    // Log the user
    return await login(email, password);
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

export async function login(email: string, password: string) {
  const auth = getAuth();

  try {
    // Sign in user - Firebase Auth (Email & Password)
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = jwt.sign(
      { uid: user.uid, email: email },
      env.jwt.secret,
      {
        expiresIn: env.jwt.expiresIn,
      }
    );

     const refreshToken = jwt.sign(
       { uid: user.uid },
       env.jwt.refreshSecret,
       { expiresIn: env.jwt.refreshExpiresIn }
     );

    return {
      userUID: user.uid,
      token,
      refreshToken,
    };
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

// ----------------------------------------------------------
// ---------------------- User - CRUD -----------------------
// ----------------------------------------------------------

export async function getUser(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUser(
  uid: string,
  data: Partial<{
    email: string;
    username: string;
    isPrivate: boolean;
    usernameLower: string;
  }>
) {
  data.usernameLower = data.username.toLowerCase();
  console.log(`updating user ${data.username}: ${JSON.stringify(data)}`);
  await updateDoc(doc(db, "users", uid), data);
}

export async function createUser(
  uid: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string
) {
  const user: User = {
    uid: uid,
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    createdAt: new Date(),
    isPrivate: false,
    usernameLower: username.toLowerCase(),
  };

  await setDoc(doc(db, "users", uid), user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const auth = getAuth();

  try {
    // Authenticate the user with the current password
    const userRef = await getDoc(doc(db, "users", userId));
    if (!userRef.exists()) {
      throw new Error("User not found");
    }
    const user = userRef.data();
    const email = user.email;

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      currentPassword
    );
    const firebaseUser = userCredential.user;

    // Update password
    await updatePassword(firebaseUser, newPassword);
  } catch (error) {
    let errorMessage = error.message;
    // Remove "Firebase: " prefix from the error message
    if (errorMessage.startsWith("Firebase: ")) {
      errorMessage = errorMessage.replace("Firebase: ", "");
    }
    throw new Error(errorMessage);
  }
}

export async function changeEmail(
  userId: string,
  currentPassword: string,
  newEmail?: string
) {
  const auth = getAuth();
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  // Check if the new email already exists in the database
  const usersCollection = collection(db, "users");
  const emailQuery = query(usersCollection, where("email", "==", newEmail));
  const emailQuerySnapshot = await getDocs(emailQuery);

  if (!emailQuerySnapshot.empty) {
    throw new Error("Email already exists");
  }

  const userData = userSnapshot.data();
  const existingEmail = userData.email;

  // Re-authenticate using the current password
  const userCredential = await signInWithEmailAndPassword(
    auth,
    existingEmail,
    currentPassword
  );
  const firebaseUser = userCredential.user;

  // If a new email is provided and different from the current one:
  // Update Firebase Authentication
  // await updateEmail(firebaseUser, newEmail);
  await verifyBeforeUpdateEmail(firebaseUser, newEmail);
}

export async function changeUsername(userId: string, newUsername: string) {
  // Get user
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  // Username already exists in the database
  const usersCollection = collection(db, "users");
  const usernameQuery = query(
    usersCollection,
    where("username", "==", newUsername)
  );
  const usernameQuerySnapshot = await getDocs(usernameQuery);

  if (!usernameQuerySnapshot.empty) {
    throw new Error("Username already exists");
  }

  const userData = userSnapshot.data();
  userData.username = newUsername;
  await updateDoc(userRef, userData);
}

export async function deleteUser(uid: string, password: string, email: string) {
  // Get user
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);
  const user = userSnapshot.data() as User;

  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;

  // Validate user exists and is authorized
  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  if (firebaseUser.uid !== uid) {
    throw new Error("User not authorized");
  }

  // 1 - Delete all content created by the user
  if (user.content) {
    for (const contentId of user.content) {
      // Delete content
      await ContentService.deleteContent(contentId);
    }
  }

  // 2 - Delete the user profile image
  if (user.profileImage) {
    StorageService.deleteFile(user.profileImage);
  }

  // 3 - Delete the user document
  if (userSnapshot.exists()) {
    await deleteDoc(userRef);
  }

  // 4 - Delete the user from Firebase Authentication
  firebaseUser.delete();
}

// ----------------------------------------------------------
// -------------------- User Interactions -------------------
// ----------------------------------------------------------

// ------------------------- CONTENT ------------------------

export async function addContentToUser(userUID: string, contentUID: string) {
  const userDoc = await getDoc(doc(db, "users", userUID));

  if (userDoc.exists()) {
    const user = userDoc.data();
    if (user?.content) {
      user.content.push(contentUID);
    } else {
      user.content = [contentUID];
    }
    await updateDoc(doc(db, "users", userUID), user);
  }
}

export async function removeContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userDoc = await getDoc(doc(db, "users", userUID));

  if (userDoc.exists()) {
    const user = userDoc.data();

    if (user?.content) {
      user.content = user.content.filter((uid: string) => uid !== contentUID);
    } else {
      console.error("user has no content!!!!! ", user);
    }
    await updateDoc(doc(db, "users", userUID), user);
  }
}

// ------------------------- LIKE ------------------------

export async function addLikedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const likedContent = user?.likedContent || [];

    if (!likedContent.includes(contentUID)) {
      likedContent.push(contentUID); // Add content ID to likedContent array
      await updateDoc(userRef, { likedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeLikedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const likedContent = user.likedContent || [];

    const index = likedContent.indexOf(contentUID);
    if (index > -1) {
      likedContent.splice(index, 1); // Remove content ID from likedContent
      await updateDoc(userRef, { likedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- BOOKMARK ------------------------

export async function addBookmarkedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const bookmarkedContent = user?.bookmarkedContent || [];

    if (!bookmarkedContent.includes(contentUID)) {
      bookmarkedContent.push(contentUID); // Add content ID to bookmarkedContent array
      await updateDoc(userRef, { bookmarkedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeBookmarkedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const bookmarkedContent = user.bookmarkedContent || [];

    const index = bookmarkedContent.indexOf(contentUID);
    if (index > -1) {
      bookmarkedContent.splice(index, 1); // Remove content ID from bookmarkedContent
      await updateDoc(userRef, { bookmarkedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- SHARE ------------------------

export async function addSharedContentToUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const sharedContent = user?.sharedContent || [];

    if (!sharedContent.includes(contentUID)) {
      sharedContent.push(contentUID); // Add content ID to sharedContent array
      await updateDoc(userRef, { sharedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

export async function removeSharedContentFromUser(
  userUID: string,
  contentUID: string
) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const sharedContent = user.sharedContent || [];

    const index = sharedContent.indexOf(contentUID);
    if (index > -1) {
      sharedContent.splice(index, 1); // Remove content ID from sharedContent
      await updateDoc(userRef, { sharedContent });
    }
  } else {
    throw new Error("User not found");
  }
}

// ------------------------- FOLLOW ------------------------

export async function followUser(userId: string, targetId: string) {
  if (userId === targetId) {
    throw new Error("Users cannot follow themselves");
  }

  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetId);

  const [userDoc, targetDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(targetRef),
  ]);

  if (!userDoc.exists() || !targetDoc.exists()) {
    throw new Error("User or target not found");
  }

  const targetData = targetDoc.data() as User; // Use the User interface

  if (targetData.isPrivate) {
    // Target user is private: create a follow request.
    const requests = targetData.followRequests || [];
    if (!requests.includes(userId)) {
      await updateDoc(targetRef, {
        followRequests: arrayUnion(userId), // Use arrayUnion
      });
    }
    //Don't do the below if it's private
    //We do not want to add the user as a follower or to the following list untill approved.
    return; // Exit the function – request only
  }

  // Target user is public: follow directly.
  const userData = userDoc.data();
  const following = userData.following || [];
  if (!following.includes(targetId)) {
    await updateDoc(userRef, { following: arrayUnion(targetId) });
  }

  const followers = targetData.followers || [];
  if (!followers.includes(userId)) {
    await updateDoc(targetRef, { followers: arrayUnion(userId) });
  }
}

export async function unfollowUser(userId: string, targetId: string) {
  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetId);

  const userDoc = await getDoc(userRef);
  const targetDoc = await getDoc(targetRef);

  if (userDoc.exists() && targetDoc.exists()) {
    const userData = userDoc.data();
    const targetData = targetDoc.data();

    // Update the user's following list
    const following = userData.following || [];
    const updatedFollowing = following.filter((id: string) => id !== targetId);
    await updateDoc(userRef, { following: updatedFollowing });

    // Update the target's followers list
    const followers = targetData.followers || [];
    const updatedFollowers = followers.filter((id: string) => id !== userId);
    await updateDoc(targetRef, { followers: updatedFollowers });
  } else {
    throw new Error("User or target not found");
  }
}

export async function requestFollow(userId: string, targetId: string) {
  const targetRef = doc(db, "users", targetId);
  const targetDoc = await getDoc(targetRef);

  if (targetDoc.exists()) {
    const targetData = targetDoc.data();
    const requests = targetData.followRequests || [];
    if (!requests.includes(userId)) {
      requests.push(userId);
      await updateDoc(targetRef, { followRequests: requests });
    }
  } else {
    throw new Error("Target user not found");
  }
}

export async function approveFollowRequest(
  userId: string,
  requesterId: string
) {
  const userRef = doc(db, "users", userId);
  const requesterRef = doc(db, "users", requesterId);

  const [userDoc, requesterDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(requesterRef),
  ]);

  if (!userDoc.exists() || !requesterDoc.exists()) {
    throw new Error("User or requester not found");
  }

  const userData = userDoc.data() as User;
  const requesterData = requesterDoc.data() as User;

  // 1. Remove requesterId from followRequests
  const followRequests = (userData.followRequests || []).filter(
    (id) => id !== requesterId
  );

  // 2. Add requesterId to followers list
  const followers = userData.followers || [];
  if (!followers.includes(requesterId)) {
    followers.push(requesterId);
  }

  // 3. Add userId to requester's following list
  const following = requesterData.following || [];
  if (!following.includes(userId)) {
    following.push(userId);
  }

  // Update both documents atomically
  await Promise.all([
    updateDoc(userRef, {
      followRequests: followRequests,
      followers: followers,
    }),
    updateDoc(requesterRef, {
      following: following,
    }),
  ]);
}

export async function rejectFollowRequest(userId: string, requesterId: string) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }
  const userData = userDoc.data() as User; // Use the User interface

  // Remove requesterId from followRequests
  const followRequests = (userData.followRequests || []).filter(
    (id) => id !== requesterId
  );
  await updateDoc(userRef, {
    followRequests: followRequests,
  });
}
