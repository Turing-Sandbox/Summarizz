import { useNavigate } from "react-router-dom";
import { Content } from "../../models/Content";
import { User } from "../../models/User";
import { useAuth } from "../../hooks/AuthProvider/useAuth";
import { useEffect, useState } from "react";
import { apiURL } from "../../scripts/api";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ContentWithUser extends Content {
  user?: User;
}

export default function ContentPreviewPopup({
  content,
  onClose,
}: {
  content: ContentWithUser;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const auth = useAuth();
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
      const response = await axios.get(
        `${apiURL}/content/related/${content.uid}${
          auth.user?.uid ? `?userId=${auth.user.uid}` : ""
        }`,
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        setRelatedContent(response.data.relatedContent);
      } 
    } catch (error) {
      console.error("Error fetching related content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewContentPage = () => {
    navigate(`/content/${content.uid}`);
  };

  const viewRelatedContent = (relatedContentId: string) => {
    navigate(`/content/${relatedContentId}`);
  };

  return (
    <div className='glassmorphic-overlay' onClick={onClose}>
      <div className='glassmorphic-popup' onClick={(e) => e.stopPropagation()}>
        <button className='close-button' onClick={onClose}>
          <XMarkIcon className='icon' />
        </button>

        <div className='popup-content'>
          {content.thumbnail && (
            <img
              src={content.thumbnail}
              alt='Content Thumbnail'
              width={300}
              height={200}
              className='popup-thumbnail'
              style={{ objectFit: "contain", maxHeight: "300px" }}
            />
          )}

          <h3 className='popup-title'>{content.title}</h3>

          <div className='popup-stats'>
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
                  className='popup-author'
                  onClick={() => navigate(`/profile/${user.uid}`)}
                >
                  {user.profileImage && (
                    <img
                      src={user.profileImage}
                      alt='Author'
                      width={40}
                      height={40}
                      className='author-image'
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <div className='author-details'>
                    <span className='author-username'>
                      @{content.user.username}
                    </span>
                    <div className='author-stats'>
                      <span>
                        Followers: {content.user.followers?.length || 0}
                      </span>
                      <span>
                        Following: {content.user.following?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Summary */}
          {content.summary && (
            <p className='popup-summary'>{content.summary}</p>
          )}

          {/* Related Content Section */}
          {relatedContent.length > 0 && (
            <div className='related-content-section'>
              <h4>Related Content</h4>
              <div className='related-content-list'>
                {relatedContent.map((item) => (
                  <div
                    key={item.uid}
                    className='related-content-item'
                    onClick={() => viewRelatedContent(item.uid)}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt='Related Content'
                        width={50}
                        height={50}
                        className='related-thumbnail'
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    <div className='related-content-info'>
                      <span className='related-title'>{item.title}</span>
                      <span className='related-stats'>
                        {item.likes || 0} likes • {item.views || 0} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <p className='loading-text'>Loading related content...</p>
          )}

          <button className='view-page-button' onClick={viewContentPage}>
            View Page
          </button>
        </div>
      </div>
    </div>
  );
}
