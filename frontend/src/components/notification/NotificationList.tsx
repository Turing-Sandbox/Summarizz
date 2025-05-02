import { Notification } from "../../models/Notification";
import NotificationView from "./NotificationView";

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  // Function to set the unread count
  setUnreadCount: (count: number) => void;
}

const NotificationList = ({
  notifications,
  unreadCount,
  setUnreadCount,
}: NotificationListProps) => {
  return (
    <div className='notification-list'>
      {notifications.length > 0 ? (
        notifications.map((notification: Notification) => (
          <NotificationView
            notification={notification}
            unreadCount={unreadCount}
            setUnreadCount={setUnreadCount}
          />
        ))
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default NotificationList;
