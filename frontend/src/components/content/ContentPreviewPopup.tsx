"use client";

import { Content } from "@/models/Content";
import { User } from "@/models/User";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";

import "@/app/styles/content/contentPreviewPopup.scss";

interface ContentWithUser extends Content {
  user?: User;
}
interface ContentPreviewPopupProps {
  content: ContentWithUser;
  onClose: () => void;
}

export default function ContentPreviewPopup({ content, onClose }: ContentPreviewPopupProps) {
  const router = useRouter();

  const viewContentPage = () => {
    router.push(`/content/${content.uid}`);
  };

  return (
    <div className="glassmorphic-overlay" onClick={onClose}>
      <div className="glassmorphic-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <XMarkIcon className="icon" />
        </button>
  
        {content.thumbnail && (
          <Image
            src={content.thumbnail}
            alt="Content Thumbnail"
            width={300}
            height={200}
            className="popup-thumbnail"
          />
        )}
  
        <h3 className="popup-title">{content.title}</h3>

        <div className="popup-stats">
          <span>Likes: {content.likes || 0}</span>
          <span>Views: {content.views || 0}</span>
          <span>Shares: {content.shares || 0}</span>
        </div>
  
        {/* Author section */}
        {content.user &&
          (() => {
            const user = content.user;
            return (
              <div
                className="popup-author"
                onClick={() => router.push(`/profile/${user.uid}`)}
              >
                {user.profileImage && (
                  <Image
                    src={user.profileImage}
                    alt="Author"
                    width={40}
                    height={40}
                    className="author-image"
                  />
                )}
                <div className="author-details">
                  <span className="author-username">@{content.user.username}</span>
                  <div className="author-stats">
                    <span>Followers: {content.user.followers?.length || 0}</span>
                    <span>Following: {content.user.following?.length || 0}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          
        {/* Summary */}
        {content.summary && (
          <p className="popup-summary">{content.summary}</p>
        )}
  
        
  
        <button className="view-page-button" onClick={viewContentPage}>
          View Page
        </button>
      </div>
    </div>
  );
}