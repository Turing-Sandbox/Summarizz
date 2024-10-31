import { db } from "../../shared/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createUser(uid: string, email: string, username: string) {
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    username,
    createdAt: serverTimestamp(),
  });
}