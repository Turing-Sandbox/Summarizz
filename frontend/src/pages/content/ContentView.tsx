import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import type { Content } from "../../models/Content";
import { User } from "../../models/User";
import { apiURL } from "../../scripts/api";
import axios from "axios";
import DOMPurify from "dompurify";

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
import CommentList from "../../components/content/CommentList";
import { normalizeContentDates } from "../../services/contentHelper";
import UserService from "../../services/UserService";
import FollowService from "../../services/FollowService";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Content page by Id, allowing users to view content based on the Id.
 *
 * @returns JSX.Element
 */
export default function ContentView() {
  // Content ID from URL
  const { id } = useParams();

  // useAuth Hook for Authentication
  const { user } = useAuth();

  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);

  const [formatedContent, setFormatedContent] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);

  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const [views, setViews] = useState(0);
  const [firstRender, setFirstRender] = useState(true);

  const navigate = useNavigate();

  // ---------------------------------------
  // -------------- useEffects -------------
  // ---------------------------------------

  // Fetch content data and creator data on mount or when id changes.
  useEffect(() => {
    /**
     *
     * @description
     * Fetches content data from the backend using the content ID from the URL.
     * If the content is found, it normalizes the date fields and sets the content state.
     * It also fetches the creator's information if available and increments the view count
     * only on the first render.
     *
     * @throws Error if the content is not found or if there is an error fetching data.
     */
    const fetchContentData = async () => {
      try {
        const contentResponse = await axios.get(`${apiURL}/content/${id}`);

        if (!contentResponse.data) {
          console.error("No content found with ID:", id);
          return;
        }
        let fetchedContent = contentResponse.data;

        fetchedContent = normalizeContentDates(fetchedContent);
        fetchedContent.uid = id;
        setContent(contentResponse.data as Content);

        // TODO: Fetch creator info with content in same request.
        if (fetchedContent.creatorUID) {
          const creator = await UserService.fetchUserWithID(
            fetchedContent.creatorUID
          );

          // Check if creator is an instance of Error
          // and handle accordingly.
          if (creator instanceof Error) {
            console.error("Error fetching creator data:", creator.message);
            setCreator(null);
          } else if (creator) {
            setCreator(creator);
          }
        }
      } catch (error) {
        console.error("Error fetching content or creator:", error);
      }
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

    fetchContentData();

    // Increment views only on first page load.
    if (firstRender) {
      incrementViews();
      setFirstRender(false);
    }
  }, [id, firstRender]);

  // Sanitize content and update related state whenever content changes.
  useEffect(() => {
    if (content) {
      let rawContent: string;
      // Use content.content (which is expected to be a string).
      if (typeof content.content === "string") {
        rawContent = content.content;
      } else if (
        typeof content.content === "object" &&
        (content.content as { content: string }).content
      ) {
        // If it accidentally becomes an object, extract the inner value.
        rawContent = (content.content as { content: string }).content;
      } else {
        rawContent = "";
      }
      const sanitized = DOMPurify.sanitize(rawContent);
      setFormatedContent(sanitized);
      setLikes(typeof content.likes === "number" ? content.likes : 0);
      setViews(content.views || 0);
      if (user?.uid) {
        setIsLiked(content.peopleWhoLiked?.includes(user?.uid) || false);
        setIsBookmarked(content.bookmarkedBy?.includes(user?.uid) || false);
      }
    }
  }, [content, user?.uid]);

  // Update status content stats
  useEffect(() => {
    if (content?.uid && user?.uid) {
      setIsBookmarked(user?.bookmarkedContent?.includes(content.uid) || false);
      setBookmarks(content?.bookmarkedBy?.length || 0);

      setIsShared(user?.sharedContent?.includes(content.uid) || false);
      setShareCount(content?.shares || 0);

      setIsLiked(user?.likedContent?.includes(content.uid) || false);
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
        await axios.delete(`${apiURL}/comment/post/${content.uid}/${user_id}`);

        // Delete content
        const content_id = content?.uid;
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

    if (user?.uid) {
      navigate(`/profile/${user.uid}`);
    } else {
      navigate("/");
    }
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
      if (!user?.uid) {
        console.error("No user ID available");
        return;
      }

      const action = isLiked ? "unlike" : "like";
      const url = `${apiURL}/content/${id}/${action}/${user.uid}`;
      const response = await axios.post(url);

      if (response.status == 200) {
        if (!isLiked && user.uid != content?.creatorUID) {
          try {
            await axios.post(`${apiURL}/notifications/create`, {
              userId: content?.creatorUID,
              notification: {
                userId: user.uid,
                username: user.username,
                type: "like",
                textPreview: `"${
                  content?.title && content?.title?.length > 30
                    ? content?.title.substring(0, 30) + "..."
                    : content?.title
                }"!`,
                contentId: content?.uid,
                timestamp: Date.now(),
                read: false,
              },
            });
          } catch (error) {
            console.error(`Error sending notifications: ${error}`);
          }
        }
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
      }
    } catch {
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
      if (!user?.uid) {
        console.error("No user ID available");
        return;
      }

      const action = isBookmarked ? "unbookmark" : "bookmark";
      const url = `${apiURL}/content/${user.uid}/${action}/${id}`;
      const response = await axios.post(url);

      if (response.status === 200) {
        setIsBookmarked(!isBookmarked);
        setBookmarks(isBookmarked ? bookmarks - 1 : bookmarks + 1);
      }
    } catch {
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
      if (!user?.uid) {
        alert("Please log in to share this article.");
        return;
      }

      const action = isShared ? "unshare" : "share";
      const userId = user.uid;
      const shareResponse = await axios.post(
        `${apiURL}/content/${id}/user/${userId}/${action}`
      );

      if (shareResponse.status == 200) {
        if (!isShared && user?.uid != content?.creatorUID) {
          try {
            await axios.post(`${apiURL}/notifications/create`, {
              userId: content?.creatorUID,
              notification: {
                userId: user.uid,
                username: user.username,
                type: "share",
                textPreview: `"${
                  content?.title && content?.title?.length > 30
                    ? content?.title.substring(0, 30) + "..."
                    : content?.title
                }"!`,
                contentId: content?.uid,
                timestamp: Date.now(),
                read: false,
              },
            });
          } catch (error) {
            console.error(`Error sending notifications: ${error}`);
          }
        }

        if (!isShared) {
          const followers = user.followers || [];

          for (let i = 0; i < followers.length; i++) {
            try {
              await axios.post(`${apiURL}/notifications/create`, {
                userId: followers[i],
                notification: {
                  userId: user.uid,
                  username: user.username,
                  type: "followedShare",
                  textPreview: `"${
                    content?.title && content.title?.length > 30
                      ? content.title.substring(0, 30) + "..."
                      : content?.title
                  }"!`,
                  contentId: content?.uid,
                  timestamp: Date.now(),
                  read: false,
                },
              });
            } catch (error) {
              console.error(`Error sending notifications: ${error}`);
            }
          }
        }

        setIsShared(!isShared);
        setShareCount(isShared ? shareCount - 1 : shareCount + 1);
      }
    } catch {
      alert(
        `Failed to ${isShared ? "unshare" : "share"} content.Please try again.`
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
    // Check if the user is logged in
    if (!user?.uid || !content?.creatorUID) {
      return;
    }

    // Update following status
    let response: { message: string } | Error;
    if (isFollowing) {
      response = await FollowService.unfollowUser(user.uid, content.creatorUID);
    } else {
      response = await FollowService.followUser(user.uid, content.creatorUID);
    }

    // Check if the response is an error
    if (response instanceof Error) {
      alert(
        `Failed to ${
          isFollowing ? "unfollow" : "follow"
        } user. Please try again.`
      );
      return;
    }

    if (isFollowing) {
      setIsFollowing(false);
      setFollowRequested(false);
    } else if (creator?.isPrivate) {
      if (!followRequested) {
        setFollowRequested(true); // Just sent a request
      } else {
        setFollowRequested(false); // Optionally allow canceling request
      }
    } else {
      setIsFollowing(true); // Just followed directly
    }
  };

  /**
   * editContent() -> void
   *
   * @description
   * Redirects user to the edit page for the current content.
   */
  const editContent = () => {
    if (content?.creatorUID === user?.uid) navigate(`edit/${content?.uid}`);
    else throw Error("You cannot edit this content");
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

          {content?.thumbnail && (
            <img
              src={content.thumbnail}
              alt='Thumbnail'
              width={200}
              height={200}
              className='thumbnail thumbnail-mobile'
            />
          )}

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
                  <div onClick={() => navigate(`/profile/${creator?.uid}`)}>
                    {creator?.profileImage ? (
                      <img
                        className='profile-image-creator'
                        src={creator.profileImage}
                        width={70}
                        height={70}
                        alt='Profile Picture'
                      />
                    ) : (
                      <div className='profile-image-creator'>
                        <h1 className='content-profile-initial'>
                          {creator?.username[0].toUpperCase()}
                        </h1>
                      </div>
                    )}
                  </div>

                  {user && user.uid !== creator?.uid && (
                    <button
                      className='follow-button'
                      onClick={handleFollow}
                      title={isFollowing ? "Unfollow Author" : "Follow Author"}
                    >
                      {isFollowing
                        ? "Following"
                        : followRequested
                        ? "Request Sent"
                        : creator?.isPrivate
                        ? "Request Follow"
                        : "Follow"}
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

          {/* Left Column: Thumbnail and Comments */}
          <div className='col-1'>
            {content?.thumbnail && (
              <img
                src={content.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
                className='thumbnail thumbnail-desktop'
              />
            )}
            {user && <CommentList content={content!} user={user!} />}
          </div>
        </div>
      </div>
    </>
  );
}
