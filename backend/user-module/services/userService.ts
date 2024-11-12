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
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    createUser(user.uid, firstName, lastName, username, email);
  } catch (error) {
    const errorMessage = error.message;
    throw new Error(errorMessage);
  }
}

export async function login(email: string, password: string) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("User signed in: ", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    });
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
