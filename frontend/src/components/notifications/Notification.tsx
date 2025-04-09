import React from 'react';
import Link from 'next/link';
import axios from 'axios';
import { apiURL } from '@/app/scripts/api';
import { useAuth } from '@/hooks/AuthProvider';

interface NotificationModel {
  // Notification ID
  notificationId?: string;
  // User ID
  userId: string;
  // Username
  username: string;
  // Type of notification (comment, like, share, follow, followedPost, followedShare)
  type: string;
  // Preview text for the notification (Comment/Content preview, just the first 30 or so characters of the 
  // title, or comment)
  textPreview?: string;
  // Content ID, may be null if the notification is a follow
  contentId?: string;
  // Comment ID, only not null if the notification is a comment
  commentId?: string;
  // Timestamp of the notification
  timestamp: number;
  // Read status
  read: boolean;
}

interface NotificationProps {
  notification: NotificationModel
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {

  const { userUID } = useAuth();
  let url = '';
  let text = '';

  switch (notification.type) {
    case 'like':
      url = `/content/${notification.contentId}`;
      text = ` has liked your post:`;
      break;
    case 'share':
      url = `/content/${notification.contentId}`;
      text = ` has shared your post:`;
      break;
    case 'comment':
      url = `/content/${notification.contentId}`;
      text = ` has commented on your post:`;
      break;
    case 'follow':
      url = `/profile/${notification.userId}`;
      text = ` has followed you!`;
      break;
    case 'followedPost':
      url = `/profile/${notification.userId}`;
      text = `, who you follow, has posted something new!`;
      break;
    case 'followedShare':
      url = `/content/${notification.contentId}`;
      text = `, who you follow, has shared this post:`;
      break;
    default:
      url = `/`;
      text = `Something's wrong, we can't identify what this notification is for. Please contact support.`;
      break;
  }

  const markRead = async () => {
    await axios.post(`${apiURL}/notifications/${userUID}/${notification.notificationId}`)
  }


  return (
    <div className="notification" key={notification.notificationId}>
      <h4 className='notificationTitle'>
        <Link className='clickable' href={`/profile/${notification.userId}`}>
          {notification.username}
        </Link>
        <span className='unClickable'>{text}</span>
        <Link className='clickable' href={url}>
          {
            notification.type === 'follow'
              ? ""
              : notification.type === 'followedPost'
                ? "Check out their profile to see."
                : notification.textPreview
          }
        </Link>
      </h4>


      <div>
        <span className='date'>{new Date(notification.timestamp).toLocaleString()}</span>
        <span className='markRead' onClick={markRead}>Mark Read</span>
      </div>
    </div >
  );
};

export default Notification;
