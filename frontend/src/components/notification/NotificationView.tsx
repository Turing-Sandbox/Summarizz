import { Notification } from "../../models/Notification";
import { useNavigate } from "react-router-dom";

interface NotificationProps {
  notification: Notification;
  unreadCount: number;
  // Function to set the unread count
  setUnreadCount: (count: number) => void;
}

export default function NotificationView({
  notification,
}: NotificationProps) {
  const navigate = useNavigate();

  let url = "";
  let text = "";

  switch (notification.type) {
    case "like":
      url = `/content/${notification.contentId}`;
      text = ` has liked your post: `;
      break;
    case "share":
      url = `/content/${notification.contentId}`;
      text = ` has shared your post: `;
      break;
    case "comment":
      url = `/content/${notification.contentId}`;
      text = ` has commented on your post: `;
      break;
    case "follow":
      url = `/profile/${notification.userId}`;
      text = ` has followed you! `;
      break;
    case "followedPost":
      url = `/profile/${notification.userId}`;
      text = ` has posted something new! `;
      break;
    case "followedShare":
      url = `/content/${notification.contentId}`;
      text = ` has shared your post: `;
      break;
    default:
      url = `/`;
      text = `Something's wrong, we can't identify what this notification is for. Please contact support.`;
      break;
  }

  return (
    <div>
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
            <a
              className='clickable'
              onClick={() => navigate(`/profile/${notification.userId}`)}
            >
              {notification.username}
            </a>
            <span className='unClickable'>{text}</span>
            <a className='clickable' onClick={() => navigate(url)}>
              {notification.type === "follow"
                ? ""
                : notification.type === "followedPost"
                ? "Check out their profile to see."
                : notification.textPreview}
            </a>
          </p>
        </div>
    </div>
  );
}
