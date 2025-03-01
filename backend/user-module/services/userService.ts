import { db } from "../../shared/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
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

    console.log("User signed in: ", user);

    const token = jwt.sign({ _id: user.uid, email: email }, "YOUR_SECRET", {
      expiresIn: "30d",
    });

    return {
      userUID: user.uid,
      token: token,
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
  data: Partial<{ email: string; username: string }>
) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

export async function createUser(
  uid: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string
) {
  console.log("Creating user...");
  const user: User = {
    uid: uid,
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    createdAt: new Date(),
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
    console.log("Password updated successfully for user:", userId);
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
  newEmail?: string,
) {
  const auth = getAuth();
  const userRef = doc(db, "users", userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
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

  const updates: Partial<{ username: string; email: string }> = {};

  // If a new email is provided and different from the current one:
  if (newEmail && newEmail !== existingEmail) {
    await verifyBeforeUpdateEmail(firebaseUser, newEmail);
  }

  // Update Firestore for username changes if any
  if (Object.keys(updates).length > 0) {
    await updateDoc(userRef, updates);
  }
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
  console.log(`Removing content: ${contentUID} from user: ${userUID}`);
  if (userDoc.exists()) {
    const user = userDoc.data();
    console.log("initial user content: ", user.content);
    if (user?.content) {
      user.content = user.content.filter((uid: string) => uid !== contentUID);
      console.log("after removing: ", user.content);
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
    console.warn("Users cannot follow themselves");
    return;
  }

  const userRef = doc(db, "users", userId);
  const targetRef = doc(db, "users", targetId);

  const userDoc = await getDoc(userRef);
  const targetDoc = await getDoc(targetRef);

  if (userDoc.exists() && targetDoc.exists()) {
    const userData = userDoc.data();
    const targetData = targetDoc.data();

    // Update the user's following list
    const following = userData.following || [];
    if (!following.includes(targetId)) following.push(targetId);
    await updateDoc(userRef, { following });

    // Update the target's followers list
    const followers = targetData.followers || [];
    if (!followers.includes(userId)) followers.push(userId);
    await updateDoc(targetRef, { followers });
  } else {
    throw new Error("User or target not found");
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
