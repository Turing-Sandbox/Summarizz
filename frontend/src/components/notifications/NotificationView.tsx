import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Notification } from "@/models/Notification";

interface NotificationProps {
  notification: Notification;
  unreadCount: number;
  // Function to set the unread count
  setUnreadCount: (count: number) => void;
}

export default function NotificationView({
  notification,
  unreadCount,
  setUnreadCount,
}: NotificationProps) {
  const { userUID } = useAuth();
  const [showNotification, setShowNotification] = useState<boolean>(true);

  let url = "";
  let text = "";

  switch (notification.type) {
    case "like":
      url = `/content/${notification.contentId}`;
      text = ` has liked your post:`;
      break;
    case "share":
      url = `/content/${notification.contentId}`;
      text = ` has shared your post:`;
      break;
    case "comment":
      url = `/content/${notification.contentId}`;
      text = ` has commented on your post:`;
      break;
    case "follow":
      url = `/profile/${notification.userId}`;
      text = ` has followed you!`;
      break;
    case "followedPost":
      url = `/profile/${notification.userId}`;
      text = `, who you follow, has posted something new!`;
      break;
    case "followedShare":
      url = `/content/${notification.contentId}`;
      text = `, who you follow, has shared this post:`;
      break;
    default:
      url = `/`;
      text = `Something's wrong, we can't identify what this notification is for. Please contact support.`;
      break;
  }

  const markRead = async () => {
    await axios.post(
      `${apiURL}/notifications/${userUID}/${notification.notificationId}`
    );
    setUnreadCount(unreadCount - 1);
    setShowNotification(false);
  };

  return (
    <div>
      {showNotification && (
        <div className='notification' key={notification.notificationId}>
          <span className='date'>
            {/* Format DD/MM/YYY, hh:mm PM/AM */}
            {new Date(notification.timestamp).toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          <p className='notificationTitle'>
            <Link
              className='clickable'
              href={`/profile/${notification.userId}`}
            >
              {notification.username}
            </Link>
            <span className='unClickable'>{text}</span>
            <Link className='clickable' href={url}>
              {notification.type === "follow"
                ? ""
                : notification.type === "followedPost"
                  ? "Check out their profile to see."
                  : notification.textPreview}
            </Link>
          </p>

          <div>
            <span className='markRead' onClick={markRead}>
              Mark Read
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
