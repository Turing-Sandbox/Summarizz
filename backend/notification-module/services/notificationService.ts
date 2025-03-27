import { db } from '../../shared/firebaseConfig';
import { getDoc, doc, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { Notification } from '../models/notificationModel';

export const pushNotification = async (userId: string, notification: Notification): Promise<void> => {
	const userRef = doc(db, 'notifications', userId);
	await setDoc(userRef, {
		notifications: arrayUnion(notification)
	}, { merge: true });
}
export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
	const userRef = doc(db, 'notifications', userId);
	await updateDoc(userRef, {
		[`notifications.${notificationId}.read`]: true
	});
};

export const getNotifications = async (userId: string) => {
	const userRef = doc(db, 'notifications', userId);
	const docSnap = await getDoc(userRef);
	return docSnap.exists() ? docSnap.data() : null;
}

// export const filterAndBundleNotifications = async (userId: string) => {
// 	const notificationsData = await getNotifications(userId);
// 	if (!notificationsData) return [];
//
// 	const notifications = notificationsData.notifications;
// 	const bundledNotifications: { [key: string]: Notification[] } = {};
//
// 	for (const key in notifications) {
// 		const notification = notifications[key];
// 		if (!bundledNotifications[notification.type]) {
// 			bundledNotifications[notification.type] = [];
// 		}
// 		bundledNotifications[notification.type].push(notification);
// 	}
//
// 	return bundledNotifications;
// }

export const bundleNotifications = async (userId: string): Promise<Notification[]> => {
	const userRef = doc(db, 'notifications', userId);
	const docSnap = await getDoc(userRef);
	const notifications = docSnap.data()?.notifications || [];

	const bundled: { [key: string]: Notification & { count?: number } } = {};
	notifications.forEach((notification: Notification) => {
		if (!bundled[notification.type]) {
			bundled[notification.type] = { ...notification, count: 1 };
		} else {
			bundled[notification.type].count! += 1;
		}
	});

	return Object.values(bundled).map((notification) => ({
		...notification,
		textPreview: `You've received ${notification.count} ${notification.type}(s) on post ${notification.contentId}`
	}));
};
