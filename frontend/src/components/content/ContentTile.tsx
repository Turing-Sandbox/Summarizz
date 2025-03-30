"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BookmarkIcon as BookmarkIconOutline,
  EyeIcon as EyeIconOutline,
  HeartIcon as HeartIconOutline,
  ShareIcon as ShareIconOutline,
  TrashIcon as TrashIconOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconFilled,
  ShareIcon as ShareIconFilled,
  BookmarkIcon as BookmarkIconFilled,
} from "@heroicons/react/24/solid";

import "@/app/styles/content/contentTile.scss";
import { useAuth } from "@/hooks/AuthProvider";

interface ContentTileProps {
  content: Content;
  index: number;
  hideStats?: boolean;
  deleteShareOption?: boolean;
  handleUnshare?: (contentId: string) => void;
  onPreview?: (content: Content) => void;
}

export default function ContentTile({
  content,
  index,
  hideStats = false,
  deleteShareOption = false,
  handleUnshare = () => {},
  onPreview,
}: ContentTileProps) {
  const router = useRouter();
  const { userUID } = useAuth();

  return (
    <div
      key={content.uid || index}
      className='content-list-item'
      onClick={() => router.push(`/content/${content.uid}`)}
    >
      <div className='content-tile-info'>
        <div className='content-tile-header'>
          <h3 className='content-item-title'>{content.title}</h3>
          {/* Unshare Button */}
          {deleteShareOption && (
            <button
              className='icon-button unshare'
              onClick={(e) => {
                e.stopPropagation();
                handleUnshare(content.uid);
              }}
              title='Unshare Content'
            >
              <TrashIconOutline className='icon delete' />
            </button>
          )}
        </div>

        <p className="content-item-date">
          {content.dateCreated
            ? `${new Date(content.dateCreated).toLocaleString("en-US", {
                month: "short",
              })} ${new Date(content.dateCreated).getDate()}${
                content.readtime ? ` - ${content.readtime} min read` : ""
              }`
            : ""}
            {onPreview && (
              <button
              className="preview-inline-button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(content);
              }}
            >
              Preview
            </button>
            )}
        </p>
      </div>

      {content.thumbnail && (
        <div className='content-thumbnail-container'>
          <Image
            src={content.thumbnail}
            alt='Thumbnail'
            width={200}
            height={200}
            className='content-thumbnail'
          />
        </div>
      )}

      {!hideStats && (
        <div className='content-stats'>
          <span className='stat-item'>
            {userUID && content.peopleWhoLiked?.includes(userUID) ? (
              <HeartIconFilled className='stat-icon' />
            ) : (
              <HeartIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.likes || 0}</p>
          </span>
          <span className='stat-item'>
            <EyeIconOutline className='stat-icon' />
            <p className='stat-number'>{content.views || 0}</p>
          </span>
          <span className='stat-item'>
            {userUID && content.sharedBy?.includes(userUID) ? (
              <ShareIconFilled className='stat-icon' />
            ) : (
              <ShareIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.shares || 0}</p>
          </span>
          <span className='stat-item'>
            {userUID && content.bookmarkedBy?.includes(userUID) ? (
              <BookmarkIconFilled className='stat-icon' />
            ) : (
              <BookmarkIconOutline className='stat-icon' />
            )}
            <p className='stat-number'>{content.bookmarkedBy?.length || 0}</p>
          </span>
        </div>
      )}
    </div>
  );
}
