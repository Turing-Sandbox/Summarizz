import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notification from './Notification';
import { apiURL } from '@/app/scripts/api';
import { useAuth } from '@/hooks/AuthProvider';
import { BellIcon } from '@heroicons/react/24/outline';
import '@/app/styles/notifications/notifications.scss'

interface NotificationModel {
  notificationId?: string;
  userId: string;
  username: string;
  type: string;
  textPreview?: string;
  contentId?: string;
  commentId?: string;
  timestamp: number;
  read: boolean;
}

const NotificationList = () => {
  const { userUID } = useAuth();
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${apiURL}/notifications/unread/${userUID}`);
      const notificationsData = response.data;

      console.log(notificationsData);

      const notificationsArray: NotificationModel[] = Object.values(notificationsData);
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const toggleDropdown = async () => {
    if (!isOpen) {
      await fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-list">
      <button onClick={toggleDropdown} className='icon-button notification-button content-interactions'>
        <BellIcon className='icon' />

        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        {isOpen && (
          <div className="notification-dropdown">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <Notification notification={notification} />
              ))
            ) : (
              <div>No new notifications.</div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default NotificationList;
