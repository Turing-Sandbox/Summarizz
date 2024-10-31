import { db } from "../../shared/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export async function createUser(uid: string, email: string, username: string) {
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    username,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUser(uid: string, data: Partial<{ email: string; username: string }>) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}