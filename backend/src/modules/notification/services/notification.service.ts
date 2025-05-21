import { db } from "../../../shared/config/firebase.config";
import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Notification } from "../models/notification.model";

/**
 * NotificationService class
 *
 * @description
 * This class provides methods for managing notifications, including fetching,
 * marking as read, and pushing new notifications.
 * 
 * @param {string} userId - The user's ID of the person receiving the notification
 * @param {Notification} notification - The notification object
 * @returns {Promise<void>} - A promise that resolves when the notification is pushed
 * @module notification
 * @submodule services
 */
export const pushNotification = async (
  userId: string,
  notification: Notification
): Promise<void> => {
  // Create the user document if it doesn't exist
  const userRef = doc(db, "notifications", userId);
  await setDoc(
    userRef,
    { preferences: {}, notifications: {} },
    { merge: true }
  );

  // Generate a new notification ID
  console.log("");
  const notificationId = doc(
    collection(db, "notifications", userId, "notifications")
  ).id;
  const notificationData = {
    ...notification,
    notificationId,
  };
  console.log(
    `Pushing new notification, with ID: ${notificationData}, and data: ${JSON.stringify(
      notificationData
    )}`
  );

  // Add the notification to the user's notifications sub-collection
  await setDoc(
    doc(
      collection(db, "notifications", userId, "notifications"),
      notificationId
    ),
    notificationData
  );
  console.log(`Notification ${notificationId} added for user ${userId}`);
};

export const markAsRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  const notificationRef = doc(
    db,
    "notifications",
    userId,
    "notifications",
    notificationId
  );

  await updateDoc(notificationRef, {
    read: true,
  });
  console.log(
    `Notification ${notificationId} marked as read for user ${userId}`
  );
};

export const getNotifications = async (userId: string) => {
  console.log(`Getting all notifications for user: ${userId}`);
  const userRef = doc(db, "notifications", userId);
  const userDoc = await getDoc(userRef);

  // Check if the user document exists
  if (!userDoc.exists()) {
    return "You have not received any recent notifications.";
  }

  const notificationsRef = collection(
    db,
    "notifications",
    userId,
    "notifications"
  );
  const notificationsSnapshot = await getDocs(notificationsRef);

  const notifications: Notification[] = notificationsSnapshot.docs.map(
    (doc) => doc.data() as Notification
  );

  return notifications;
};

export const getNewNotifications = async (userId: string) => {
  const notificationsRef = collection(
    db,
    "notifications",
    userId,
    "notifications"
  );
  const q = query(notificationsRef, where("read", "==", false)); // Query for unread notifications
  const querySnapshot = await getDocs(q);

  const unreadNotifications: Notification[] = querySnapshot.docs.map(
	(doc) => doc.data() as Notification
  );

  return unreadNotifications;
};
