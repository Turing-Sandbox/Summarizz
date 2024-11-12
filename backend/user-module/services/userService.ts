import { db } from "../../shared/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { User } from "../models/userModel";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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
    createUser(user.uid, firstName, lastName, username, email);
    return user;
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User signed in: ", user);
    return user;
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
