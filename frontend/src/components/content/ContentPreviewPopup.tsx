"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";

import "@/app/styles/content/contentPreviewPopup.scss";

interface ContentPreviewPopupProps {
  content: Content;
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
        {content.summary && <p className="popup-summary">{content.summary}</p>}
        <div className="popup-stats">
          <span>Likes: {content.likes || 0}</span>
          <span>Views: {content.views || 0}</span>
          <span>Shares: {content.shares || 0}</span>
        </div>
        <button className="view-page-button" onClick={viewContentPage}>
          View Page
        </button>
      </div>
    </div>
  );
}