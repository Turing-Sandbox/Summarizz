import { db } from '../../shared/firebaseConfig';
import { getDoc, doc, setDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Notification } from '../models/notificationModel';

export const pushNotification = async (userId: string, notification: Notification): Promise<void> => {
	// Create the user document if it doesn't exist
	const userRef = doc(db, 'notifications', userId);
	await setDoc(userRef, { preferences: {}, notifications: {} }, { merge: true });

	// Generate a new notification ID
	console.log("")
	const notificationId = doc(collection(db, 'notifications', userId, 'notifications')).id;
	const notificationData = {
		...notification,
		notificationId,
	};
	console.log(`Pushing new notification, with ID: ${notificationData}, and data: ${JSON.stringify(notificationData)}`)

	// Add the notification to the user's notifications sub-collection
	await setDoc(doc(collection(db, 'notifications', userId, 'notifications'), notificationId), notificationData);
	console.log(`Notification ${notificationId} added for user ${userId}`);
}



export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
	const notificationRef = doc(db, 'notifications', userId, 'notifications', notificationId);

	await updateDoc(notificationRef, {
		read: true,
	});
	console.log(`Notification ${notificationId} marked as read for user ${userId}`);
}

export const getNotifications = async (userId: string) => {
	console.log(`Getting all notifications for user: ${userId}`)
	const userRef = doc(db, 'notifications', userId);
	const userDoc = await getDoc(userRef);

	// Check if the user document exists
	if (!userDoc.exists()) {
		return "You have not received any recent notifications.";
	}

	const notificationsRef = collection(db, 'notifications', userId, 'notifications');
	const notificationsSnapshot = await getDocs(notificationsRef);

	// console.log(notificationsSnapshot)
	const notifications = {};
	notificationsSnapshot.forEach((doc) => {
		notifications[doc.id] = doc.data();
		console.log(`doc.id: ${doc.id},\ndoc: ${JSON.stringify(doc.data())}`)
	});

	// Check if there are no notifications
	if (Object.keys(notifications).length === 0) {
		return "You have not received any recent notifications.";
	}

	return notifications;
}

export const getNewNotifications = async (userId: string) => {
	const notificationsRef = collection(db, 'notifications', userId, 'notifications');
	const q = query(notificationsRef, where("read", "==", false)); // Query for unread notifications
	const querySnapshot = await getDocs(q);

	const unreadNotifications = {};
	querySnapshot.forEach((doc) => {
		unreadNotifications[doc.id] = doc.data();
	});

	return unreadNotifications;
}

// export const aggregateNotifications = async (userId: string) => {
// 	const unreadNotifications = await getNewNotifications(userId);
//
// 	const summary = {
// 		likes: {},
// 		comments: {},
// 		shares: {},
// 		follows: 0,
// 		followedPosts: {},
// 		followedShares: {},
// 		userPosts: new Set(),
// 	};
//
// 	for (const notificationId in unreadNotifications) {
// 		const notification = unreadNotifications[notificationId];
//
// 		switch (notification.type) {
// 			case "like":
// 				if (!summary.likes[notification.contentId]) {
// 					summary.likes[notification.contentId] = 0;
// 				}
// 				summary.likes[notification.contentId] += 1;
// 				break;
// 			case "comment":
// 				if (!summary.comments[notification.contentId]) {
// 					summary.comments[notification.contentId] = 0;
// 				}
// 				summary.comments[notification.contentId] += 1;
// 				break;
// 			case "share":
// 				if (!summary.shares[notification.contentId]) {
// 					summary.shares[notification.contentId] = 0;
// 				}
// 				summary.shares[notification.contentId] += 1;
// 				break;
// 			case "follow":
// 				summary.follows += 1;
// 				break;
// 			case "followedPost":
// 				if (!summary.followedPosts[notification.userId]) {
// 					summary.followedPosts[notification.userId] = 0;
// 				}
// 				summary.followedPosts[notification.userId] += 1;
// 				break;
// 			case "followedShare":
// 				if (!summary.followedShares[notification.userId]) {
// 					summary.followedShares[notification.userId] = 0;
// 				}
// 				summary.followedShares[notification.userId] += 1;
// 				break;
// 			default:
// 				break;
// 		}
//
// 		// Track unique users who posted content
// 		if (notification.type === "followedPost" || notification.type === "followedShare") {
// 			summary.userPosts.add(notification.userId);
// 		}
// 	}
//
// 	// Generate summary messages
// 	const messages = [];
//
// 	// Likes summary
// 	for (const contentId in summary.likes) {
// 		messages.push(`You received ${summary.likes[contentId]} new like${summary.likes[contentId] > 1 ? 's' : ''} on your post!`);
// 	}
//
// 	// Comments summary
// 	for (const contentId in summary.comments) {
// 		messages.push(`You received ${summary.comments[contentId]} new comment${summary.comments[contentId] > 1 ? 's' : ''} on your post!`);
// 	}
//
// 	// Shares summary
// 	for (const contentId in summary.shares) {
// 		messages.push(`You received ${summary.shares[contentId]} new share${summary.shares[contentId] > 1 ? 's' : ''} on your post!`);
// 	}
//
// 	// Follows summary
// 	if (summary.follows > 0) {
// 		messages.push(`You have ${summary.follows} new follower${summary.follows > 1 ? 's' : ''}!`);
// 	}
//
// 	// Followed posts summary
// 	for (const userId in summary.followedPosts) {
// 		messages.push(`You have ${summary.followedPosts[userId]} new post${summary.followedPosts[userId] > 1 ? 's' : ''} from ${userId}.`);
// 	}
//
// 	// Followed shares summary
// 	for (const userId in summary.followedShares) {
// 		messages.push(`You have ${summary.followedShares[userId]} new share${summary.followedShares[userId] > 1 ? 's' : ''} from ${userId}.`);
// 	}
//
// 	// Unique users who posted content
// 	if (summary.userPosts.size > 0) {
// 		messages.push(`You have new content from ${summary.userPosts.size} user${summary.userPosts.size > 1 ? 's' : ''} you follow!`);
// 	}
//
// 	return messages.length > 0 ? messages.join(' ') : "No new notifications.";
// }
