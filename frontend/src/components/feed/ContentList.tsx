import { useEffect, useState } from "react";
import ContentTile from "../content/ContentTile";
import { Content } from "../../models/Content";
import { apiURL } from "../../scripts/api";
import axios from "axios";
import { normalizeContentDates } from "../../services/contentHelper";
import { useAuth } from "../../hooks/useAuth";
import ContentPreviewPopup from "../content/ContentPreviewPopup";

export default function ContentList({ tab }: { tab: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<Content[]>([]);

  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  useEffect(() => {
    setIsLoading(true);

    fetchContent();

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    // Function to reload the Mondiad script (ADS)
    const reloadMondiadScript = () => {
      const existingScript = document.querySelector(
        "script[src='https://ss.mrmnd.com/native.js']"
      );
      if (existingScript) {
        // Remove the existing script
        existingScript.remove();
      }

      // Create a new script element
      const script = document.createElement("script");
      script.src = "https://ss.mrmnd.com/native.js";
      script.async = true;

      // Append the script to the document head
      document.head.appendChild(script);
    };

    // Reload the script whenever the component renders
    reloadMondiadScript();
  }, [contents]);

  async function fetchContent(): Promise<boolean> {
    try {
      let response;

      switch (tab) {
        case "personalized":
          if (!auth.user?.uid) {
            setContents([]);
            return false;
          }
          response = await axios.get(
            `${apiURL}/content/feed/${auth.user.uid}`,
            { timeout: 5000, withCredentials: true }
          );
          break;
        case "latest":
          response = await axios.get(`${apiURL}/content`, {
            timeout: 5000,
          });
          break;
        case "trending":
          response = await axios.get(`${apiURL}/content/feed/trending`, {
            timeout: 5000,
          });
          break;
        default:
          return false;
      }

      if (response.data && response.data.success) {
        let normalizedContent;

        switch (tab) {
          case "personalized":
            normalizedContent = response.data.personalizedContent.map(
              (content: Content) => normalizeContentDates(content)
            );
            break;
          case "latest":
            normalizedContent = response.data.content.map((content: Content) =>
              normalizeContentDates(content)
            );
            break;
          case "trending":
            normalizedContent = response.data.trendingContent.map(
              (content: Content) => normalizeContentDates(content)
            );
            break;
          default:
            return false;
        }

        setContents(normalizedContent);
        return true;
      } else {
        setContents([]);
        setError("No content found");
      }
    } catch {
      setContents([]);
      setError("Failed to fetch content. Please try again.");
    }

    setIsLoading(false);
    return false;
  }

  const openPreview = (content: Content) => {
    setPreviewContent(content);
  };

  const closePreview = () => {
    setPreviewContent(null);
  };

  return (
    <div>
      {/* Personalized Content Section */}
      <h2 className='feed-section-h2'>
        {tab === "personalized"
          ? "Content For You"
          : tab === "latest"
          ? "See the Latest Content"
          : "What's Trending"}
      </h2>
      {isLoading ? (
        <div className='content-list'>
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
        </div>
      ) : contents.length === 0 ? (
        <h3>No content found</h3>
      ) : (
        <div className='content-list'>
          {contents.map((content, index) => (
            <div key={`${content.uid || index}`}>
              {index % 8 === 0 ? (
                <div className='ad-tile' key={`ad-personalized-${index}`}>
                  <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                </div>
              ) : (
                <ContentTile
                  key={`content-personalized-${content.uid || index}`}
                  content={content}
                  index={index}
                  onPreview={(c) => openPreview(c)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className='error'>{error}</p>}
      {previewContent && (
        <ContentPreviewPopup content={previewContent} onClose={closePreview} />
      )}
    </div>
  );
}
