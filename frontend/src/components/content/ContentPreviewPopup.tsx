"use client";

import { Content } from "@/models/Content";
import { User } from "@/models/User";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/app/scripts/api";
import { useAuth } from "@/hooks/AuthProvider";

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
  const { userUID } = useAuth();
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // UseEffect to fetch related content when the content uid changes
  useEffect(() => {
    if (content?.uid) {
      fetchRelatedContent();
    }
  }, [content?.uid]);

  // Fetch related content from the content/related endpoint
  const fetchRelatedContent = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching related content for:', content.uid);
      console.log('API URL:', `${apiURL}/content/related/${content.uid}${userUID ? `?userId=${userUID}` : ''}`);

      const response = await axios.get(
        `${apiURL}/content/related/${content.uid}${userUID ? `?userId=${userUID}` : ''}`
      );

      console.log('Related content response:', response.data);

      if (response.data && response.data.success) {
        console.log('Setting related content:', response.data.relatedContent);
        setRelatedContent(response.data.relatedContent);
      } else {
        console.log('No success in response or empty data');
      }
    } catch (error) {
      console.error('Error fetching related content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewContentPage = () => {
    router.push(`/content/${content.uid}`);
  };

  const viewRelatedContent = (relatedContentId: string) => {
    router.push(`/content/${relatedContentId}`);
  };

  return (
    <div className="glassmorphic-overlay" onClick={onClose}>
      <div className="glassmorphic-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <XMarkIcon className="icon" />
        </button>

        <div className="popup-content">
          {content.thumbnail && (
            <Image
              src={content.thumbnail}
              alt="Content Thumbnail"
              width={300}
              height={200}
              className="popup-thumbnail"
              style={{ objectFit: 'contain', maxHeight: '300px' }}
            />
          )}

          <h3 className="popup-title">{content.title}</h3>

          <div className="popup-stats">
            <span>Likes: {content.likes || 0}</span>
            <span>Views: {content.views || 0}</span>
            <span>Shares: {content.shares || 0}</span>
          </div>

          {/* Author Section */}
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
                      style={{ objectFit: 'cover' }}
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

          {/* Related Content Section */}
          {relatedContent.length > 0 && (
            <div className="related-content-section">
              <h4>Related Content</h4>
              <div className="related-content-list">
                {relatedContent.map((item) => (
                  <div
                    key={item.uid}
                    className="related-content-item"
                    onClick={() => viewRelatedContent(item.uid)}
                  >
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt="Related Content"
                        width={50}
                        height={50}
                        className="related-thumbnail"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div className="related-content-info">
                      <span className="related-title">{item.title}</span>
                      <span className="related-stats">
                        {item.likes || 0} likes • {item.views || 0} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && <p className="loading-text">Loading related content...</p>}

          <button className="view-page-button" onClick={viewContentPage}>
            View Page
          </button>
        </div>
      </div>
    </div>
  );
}