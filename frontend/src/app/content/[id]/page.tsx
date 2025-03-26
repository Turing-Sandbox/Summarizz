"use client";

import { useEffect, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import DOMPurify from "dompurify";
import { Content } from "@/models/Content";
import { User } from "@/models/User";

import Image from "next/image";
import CommentList from "@/components/content/CommentList";

import {
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid,
  PencilIcon as PencilIconSolid,
  ShareIcon as ShareIconSolid,
  TrashIcon as TrashIconSolid,
} from "@heroicons/react/24/solid";

import {
  BookmarkIcon as BookmarkIconOutline,
  HeartIcon as HeartIconOutline,
  ShareIcon as ShareIconOutline,
} from "@heroicons/react/24/outline";

// Styles
import "@/app/styles/content/viewContent.scss";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Content page by Id, allowing users to view content based on the Id.
 *
 * @returns JSX.Element
 */
export default function Page() {
  // Content ID from URL
  const { id } = useParams();

  // useAuth Hook for Authentication
  const { userUID } = useAuth();

  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [formatedContent, setFormatedContent] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const [views, setViews] = useState(0);
  const [firstRender, setFirstRender] = useState(true);

  const router = useRouter();

  // ---------------------------------------
  // -------------- Helpers ----------------
  // ---------------------------------------

  // Normalizes date fields into proper Date objects
  function normalizeContentDates(contentObj: any): any {
    if (contentObj.dateCreated) {
      if (typeof contentObj.dateCreated === "string") {
        contentObj.dateCreated = new Date(contentObj.dateCreated);
      } else if (contentObj.dateCreated.seconds) {
        contentObj.dateCreated = new Date(
          contentObj.dateCreated.seconds * 1000
        );
      }
    }
    if (contentObj.dateUpdated) {
      if (typeof contentObj.dateUpdated === "string") {
        contentObj.dateUpdated = new Date(contentObj.dateUpdated);
      } else if (contentObj.dateUpdated.seconds) {
        contentObj.dateUpdated = new Date(
          contentObj.dateUpdated.seconds * 1000
        );
      }
    }
    return contentObj;
  }

  // ---------------------------------------
  // -------------- Data Fetching ----------
  // ---------------------------------------

  /**
   * fetchLoggedInuser() -> void
   *
   * @description
   * Fetches the logged in user's information from the backend using the userUID
   * provided in the AuthProvider, this will set the user accordingly.
   *
   * @returns void
   */
  const fetchUser = async (id: string): Promise<User | undefined> => {
    try {
      const res = await axios.get(`${apiURL}/user/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      return undefined;
    }
  };

  // Fetch content data and, if available, its creator data.
  const fetchContentData = async () => {
    try {
      const contentResponse = await axios.get(`${apiURL}/content/${id}`);

      if (!contentResponse.data) {
        console.error("No content found with ID:", id);
        return;
      }
      let fetchedContent = contentResponse.data;

      fetchedContent = normalizeContentDates(fetchedContent);
      fetchedContent.id = id;
      setContent(contentResponse.data as Content);

      // Fetch creator info if available.
      if (fetchedContent.creatorUID) {
        const creator = await fetchUser(fetchedContent.creatorUID);
        if (creator) {
          setCreator(creator);
        }
      }

      // Increment views only on first page load.
      if (firstRender) {
        await incrementViews();
        setFirstRender(false);
      }
    } catch (error) {
      console.error("Error fetching content or creator:", error);
    }
  };

  // ---------------------------------------
  // -------------- useEffects -------------
  // ---------------------------------------

  // Fetch logged-in user when userUID changes.
  useEffect(() => {
    (async () => {
      if (userUID) {
        const user = await fetchUser(userUID);
        if (user) {
          setUser(user);
        }
      }
    })();
  }, [userUID]);

  // Fetch content data and creator data on mount or when id changes.
  useEffect(() => {
    fetchContentData();
  }, [id]);

  // Sanitize content and update related state whenever content changes.
  useEffect(() => {
    if (content) {
      let rawContent: string;
      // Use content.content (which is expected to be a string).
      if (typeof content.content === "string") {
        rawContent = content.content;
      } else if (
        typeof content.content === "object" &&
        (content.content as any).content
      ) {
        // If it accidentally becomes an object, extract the inner value.
        rawContent = (content.content as any).content;
      } else {
        rawContent = "";
      }
      const sanitized = DOMPurify.sanitize(rawContent);
      setFormatedContent(sanitized);
      setLikes(typeof content.likes === "number" ? content.likes : 0);
      setViews(content.views || 0);
      if (userUID) {
        setIsLiked(content.peopleWhoLiked?.includes(userUID) || false);
        setIsBookmarked(content.bookmarkedBy?.includes(userUID) || false);
      }
    }
  }, [content, userUID]);

  // Update status content stats
  useEffect(() => {
    if (content?.id) {
      setIsBookmarked(user?.bookmarkedContent?.includes(content.id) || false);
      setBookmarks(content?.bookmarkedBy?.length || 0);

      setIsShared(user?.sharedContent?.includes(content.id) || false);
      setShareCount(content?.shares || 0);

      setIsLiked(user?.likedContent?.includes(content.id) || false);
      setLikes(content?.peopleWhoLiked?.length || 0);
    }

    if (content?.creatorUID) {
      setIsFollowing(user?.following?.includes(content.creatorUID) || false);
    }
  }, [content, user]);

  // ---------------------------------------
  // -------------- Handlers ---------------
  // ---------------------------------------

  /**
   * handleDelete() -> void
   *
   * @description
   * Handles the delete action for the content, deleting the content and thumbnail
   * if it exists, and redirecting to the profile page of the creator.
   *
   * @returns void
   */
  const handleDelete = async () => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    if (localStorage.getItem("userUID") === content?.creatorUID) {
      try {
        // Delete comments
        const user_id = content?.creatorUID;
        await axios.delete(`${apiURL}/comment/post/${content.id}/${user_id}`);

        // Delete content
        const content_id = content?.id;
        await axios({
          method: "delete",
          url: `${apiURL}/content/${content_id}`,
          headers: {},
          data: {
            userId: user_id,
          },
        });
      } catch (error) {
        alert(error);
      }
    } else {
      alert(
        "You do not have permission to delete this page as you are not the creator."
      );
    }

    router.push(`/profile/${userUID}`);
  };

  /**
   * handleLike() -> void
   *
   * @description
   * Handles the liking and unliking of the content, setting the isLiked state
   * to the opposite of the current state.
   *
   * @returns {Promise<void>}
   */
  const handleLike = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isLiked ? "unlike" : "like";
      const url = `${apiURL}/content/${id}/${action}/${userUID}`;
      const response = await axios.post(url);

      if (response.status == 200) {
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${isLiked ? "unlike" : "like"} content. Please try again.`
      );
    }
  };

  /**
   * handleBookmark() -> void
   *
   * @description
   * Handles the bookmarking and unbookmarking of the content,
   * setting the isBookmarked state to the opposite of the current state.
   *
   * @returns void
   */
  const handleBookmark = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isBookmarked ? "unbookmark" : "bookmark";
      const url = `${apiURL}/content/${userUID}/${action}/${id}`;
      const response = await axios.post(url);

      if (response.status === 200) {
        setIsBookmarked(!isBookmarked);
        setBookmarks(isBookmarked ? bookmarks - 1 : bookmarks + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${
          isBookmarked ? "unbookmark" : "bookmark"
        } content. Please try again.`
      );
    }
  };

  /**
   * handleShare() -> void
   *
   * @description
   * Handles the share action for the content, copying the share
   * link to the clipboard.
   *
   * @returns void
   */
  const handleShare = async () => {
    try {
      // Check if the user is logged in via AuthProvider
      if (!userUID) {
        alert("Please log in to share this article.");
        return;
      }

      const action = isShared ? "unshare" : "share";
      const userId = userUID;
      const shareResponse = await axios.post(
        `${apiURL}/content/${id}/user/${userId}/${action}`

        // `${apiURL}/content/user/${userId}/${action}/${id}`
      );

      if (shareResponse.status == 200) {
        setIsShared(!isShared);
        setShareCount(isShared ? shareCount - 1 : shareCount + 1);
      }
    } catch (error) {
      alert(
        `Failed to ${isShared ? "unshare" : "share"} content. Please try again.`
      );
    }
  };

  /**
   * handleFollow() -> void
   *
   * @description
   * Handles the follow/unfollow actions for the creator of the content.
   *
   * @returns void
   */
  const handleFollow = async () => {
    try {
      if (!userUID || !content?.creatorUID) {
        console.error("User ID or Creator ID not available");
        return;
      }

      const action = isFollowing ? "unfollow" : "follow";
      const url = `${apiURL}/user/${userUID}/${action}/${content.creatorUID}`;
      const res = await axios.post(url);

      if (res.status === 200) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      alert(
        `Failed to ${
          isFollowing ? "unfollow" : "follow"
        } user. Please try again.`
      );
    }
  };

  /**
   * editContent() -> void
   *
   * @description
   * Redirects user to the edit page for the current content.
   */
  const editContent = () => {
    if (content?.creatorUID === userUID) redirect(`edit/${content?.id}`);
    else throw Error("You cannot edit this content");
  };

  /**
   * incrementViews() -> void
   *
   * @description
   * Increments the number of times the content has been viewed.
   */
  const incrementViews = async () => {
    try {
      await axios.put(`${apiURL}/content/views/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const isCreator = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userUID") === content?.creatorUID;
    }
    return false;
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='main-content'>
        <div className='row'>
          {/* Left Column: Thumbnail and Comments */}
          <div className='col-1'>
            {content?.thumbnail && (
              <Image
                src={content.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
                className='thumbnail'
              />
            )}
            <CommentList />
          </div>

          {/* Right Column: Content Details */}
          <div className='col-2'>
            {/* Title and Interaction Buttons */}
            <div className='content-title-bar'>
              <h1 className='content-title'>{content?.title}</h1>

              <div className='content-interactions'>
                {/* LIKE BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleLike}
                  title={isLiked ? "Unlike Content" : "Like Content"}
                >
                  {isLiked ? (
                    <HeartIconSolid className='icon' />
                  ) : (
                    <HeartIconOutline className='icon ' />
                  )}
                  {likes > 0 && <span className='icon counter'>{likes}</span>}
                </button>

                {/* BOOKMARK BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleBookmark}
                  title={
                    isBookmarked ? "Unbookmark Content" : "Bookmark Content"
                  }
                >
                  {isBookmarked ? (
                    <BookmarkIconSolid className='icon' />
                  ) : (
                    <BookmarkIconOutline className='icon' />
                  )}
                  {bookmarks > 0 && (
                    <span className='icon counter'>{bookmarks}</span>
                  )}
                </button>

                {/* SHARE BUTTON */}
                <button
                  className='icon-button'
                  onClick={handleShare}
                  title={isShared ? "Unshare Content" : "Share Content"}
                >
                  {isShared ? (
                    <ShareIconSolid className='icon' />
                  ) : (
                    <ShareIconOutline className='icon' />
                  )}
                  {shareCount > 0 && (
                    <span className='icon counter'>{shareCount}</span>
                  )}
                </button>
              </div>

              {/* EDIT & DELETE (Only for Creator) */}
              {isCreator() && (
                <div className='content-interactions'>
                  <div className='icon-container'>
                    <button
                      className='icon-button'
                      onClick={editContent}
                      title='Edit Content'
                    >
                      <PencilIconSolid className='icon edit' />
                    </button>
                    <button
                      className='icon-button'
                      onClick={handleDelete}
                      title='Delete Content'
                    >
                      <TrashIconSolid className='icon delete' />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Header: Info and Creator */}
            <div className='content-header'>
              <div className='content-info'>
                {/* LEFT SIDE (VIEW, DATE, READ TIME AND CREATOR) */}
                <p className='username'>By: {creator?.username}</p>
                <p>
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
                </p>
                <p>{views ? ` ${views} views` : ""}</p>

                <div className='creator-follow-section'>
                  {/* CLICK CREATOR IMAGE TO NAVIGATE TO THEIR PROFILE */}
                  <div onClick={() => router.push(`/profile/${creator?.uid}`)}>
                    {creator?.profileImage ? (
                      <Image
                        className='profile-image-creator'
                        src={creator.profileImage}
                        width={70}
                        height={70}
                        alt='Profile Picture'
                      />
                    ) : (
                      <div className='profile-image-creator'>
                        <h1 className='profile-initial'>
                          {creator?.username[0].toUpperCase()}
                        </h1>
                      </div>
                    )}
                  </div>

                  {userUID && userUID !== creator?.uid && (
                    <button
                      className='follow-button'
                      onClick={handleFollow}
                      title={isFollowing ? "Unfollow Author" : "Follow Author"}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className='spliter'></div>

              {/* RIGHT SIDE - SUMMARY */}
              <div className='content-summary'>
                <p>Article Summary</p>
              </div>
            </div>

            {/* Render the Main Content */}
            {formatedContent && (
              <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
