import NotificationView from "./NotificationView";
import "@/app/styles/notifications/notifications.scss";
import { Notification } from "@/models/Notification";

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList = ({ notifications }: NotificationListProps) => {
  return (
    <div className='notification-list'>
      {notifications.length > 0 ? (
        notifications.map((notification: Notification) => (
          <NotificationView notification={notification} />
        ))
      ) : (
        <div>No new notifications.</div>
      )}
    </div>
  );
};

export default NotificationList;
