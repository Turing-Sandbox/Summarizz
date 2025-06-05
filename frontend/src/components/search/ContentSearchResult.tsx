import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { SearchContent } from "../../models/SearchResult";
import { generateColorFromText } from "../../utils/colorUtils";

export default function ContentSearchResult({ content }: { content: SearchContent }) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate a consistent color based on the content title
  const placeholderColor = generateColorFromText(content.title);

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected content's page.
   *
   * @returns void
   */
  const handleClick = () => {
    navigate(`/content/${content.content_id}`);
  };

  // Format the date to a more readable format
  const formatDate = (date: Date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle mouse enter - start timer to show tooltip
  const handleMouseEnter = () => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // Show tooltip after 1 second
  };

  // Handle mouse leave - clear timer and hide tooltip
  const handleMouseLeave = () => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    setShowTooltip(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
        tooltipTimer.current = null;
      }
    };
  }, []);

  // Handle image loading and errors
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(true);
    setImageError(true);
  };

  // Get first letter of title for placeholder
  function getFirstLetter() {
    return content.title ? content.title[0].toUpperCase() : 'A';
  };

  // Check if we should show the actual image
  const hasValidImage = content.profile_image && !imageError;

  return (
    <div 
      className='contentSearchResults' 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={contentRef}
    >
      <div className="content-thumbnail-container">
        {/* Always show placeholder until image is loaded */}
        {(!imageLoaded || !hasValidImage) && (
          <div 
            className="content-thumbnail-placeholder"
            style={{ backgroundColor: placeholderColor }}
          >
            <span>{getFirstLetter()}</span>
          </div>
        )}
        
        {/* Only render img tag if we have a valid image */}
        {content.profile_image && (
          <img
            src={content.profile_image}
            alt={content.title}
            className={`search-content-thumbnail ${imageLoaded && !imageError ? 'visible' : 'hidden'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
          />
        )}
      </div>
      
      <div className="content-info">
        <h3>{content.title}</h3>
        
        <div className="content-meta">
          <div className="content-creator">
            <span className="creator-name">
              {content.first_name} {content.last_name}
            </span>
            <span className="creator-username">@{content.username}</span>
          </div>
          <span className="content-date">{formatDate(content.date_created)}</span>
        </div>
      </div>
      
      {/* Tooltip that appears after hovering for 1 second */}
      {showTooltip && content.summary && (
        <div 
          className="content-summary-tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          {content.summary}
        </div>
      )}
    </div>
  );
}
