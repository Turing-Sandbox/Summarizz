import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/config/firebase.config';
import { UserPreferences } from '../models/userPreferences';

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
	const userRef = doc(db, 'notifications', userId);
	const docSnap = await getDoc(userRef);
	return docSnap.data()?.preferences || null;
}

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
	const userRef = doc(db, 'notifications', userId);
	await setDoc(userRef, { preferences }, { merge: true });
};
