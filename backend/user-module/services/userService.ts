import { db } from "../../shared/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { User } from "../models/userModel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import jwt from "jsonwebtoken";

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

export async function removeContentFromUser(userUID: string, contentUID: string) {
  const userDoc = await getDoc(doc(db, "users", userUID));
  console.log(`Removing content: ${contentUID} from user: ${userUID}`)
  if (userDoc.exists()) {
    const user = userDoc.data();
    console.log("initial user content: ", user.content)
    if (user?.content) {
      user.content = user.content.filter((uid: string) => uid !== contentUID);
      console.log("after removing: ", user.content)
    } else {
      console.error("user has no content!!!!! ", user)
    }
    await updateDoc(doc(db, "users", userUID), user);
  }
}


export async function addLikedContentToUser(userUID: string, contentUID: string) {
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

export async function removeLikedContentFromUser(userUID: string, contentUID: string) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const likedContent = user.likedContent || [];

    const index = likedContent.indexOf(contentUID);
    if (index > -1) {
      likedContent.splice(index, 1);  // Remove content ID from likedContent
      await updateDoc(userRef, { likedContent });
    }    
  } else {
    throw new Error("User not found");
  }
}

export async function addBookmarkedContentToUser(userUID: string, contentUID: string) {
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

export async function removeBookmarkedContentFromUser(userUID: string, contentUID: string) {
  const userRef = doc(db, "users", userUID);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const user = userSnapshot.data();
    const bookmarkedContent = user.bookmarkedContent || [];

    const index = bookmarkedContent.indexOf(contentUID);
    if (index > -1) {
      bookmarkedContent.splice(index, 1);  // Remove content ID from bookmarkedContent
      await updateDoc(userRef, { bookmarkedContent });
    }    
  } else {
    throw new Error("User not found");
  }
}

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
