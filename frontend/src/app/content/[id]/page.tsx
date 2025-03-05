"use client";

import { useEffect, useRef, useState } from "react";
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
  UserPlusIcon as UserPlusIconSolid,
} from "@heroicons/react/24/solid";

import {
  BookmarkIcon as BookmarkIconOutline,
  HeartIcon as HeartIconOutline,
  PencilIcon as PencilIconOutline,
  ShareIcon as ShareIconOutline,
  TrashIcon as TrashIconOutline,
  UserPlusIcon as UserPlusIconOutline,
} from "@heroicons/react/24/outline";

// Styles
import "@/app/styles/content/viewContent.scss";
import Layout from "../layout";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Content page by Id, allowing users to view content based on the Id.
 *
 * @returns JSX.Element
 */
export default function Page() {
  // id for Content
  const { id } = useParams();

  // useAuth Hook for Authentication
  const { userUID } = useAuth();

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
  const [views, setViews] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [firstRender, setFirstRender] = useState(true); // Used to determine whether to increment the view count on rerenders or not.

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  const hasFetchedData = useRef(false);
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
        contentObj.dateCreated = new Date(contentObj.dateCreated.seconds * 1000);
      }
    }
    if (contentObj.dateUpdated) {
      if (typeof contentObj.dateUpdated === "string") {
        contentObj.dateUpdated = new Date(contentObj.dateUpdated);
      } else if (contentObj.dateUpdated.seconds) {
        contentObj.dateUpdated = new Date(contentObj.dateUpdated.seconds * 1000);
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
  const fetchLoggedInUser = async () => {
    if (userUID) {
      try {
        const res = await axios.get(`${apiURL}/user/${userUID}`);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    }
  };

  // Fetch content data and, if available, its creator data.
  const fetchContentData = async () => {
    try {
      const contentResponse = await axios.get(`${apiURL}/content/${id}`);
      let fetchedContent = contentResponse.data;

      // Normalize date fields.
      fetchedContent = normalizeContentDates(fetchedContent);
      fetchedContent.id = id;
      setContent(fetchedContent);

      // Update like/bookmark status.
      if (userUID) {
        setIsLiked(fetchedContent.peopleWhoLiked?.includes(userUID) || false);
        setIsBookmarked(fetchedContent.bookmarkedBy?.includes(userUID) || false);
      }

      // Fetch creator info if available.
      if (fetchedContent.creatorUID) {
        const creatorResponse = await axios.get(`${apiURL}/user/${fetchedContent.creatorUID}`);
        setCreator(creatorResponse.data);
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
    if (userUID) {
        fetchLoggedInUser();
    }
  }, [userUID]);

  // Fetch content data and creator data on mount or when id/userUID changes.
  useEffect(() => {
    fetchContentData();
  }, [id, userUID]);

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
    if (localStorage.getItem("userUID") === content?.creatorUID) {
      try {
        const user_id = content?.creatorUID;
        await axios.delete(`${apiURL}/comment/post/${content.id}/${user_id}`);

        const content_id = content?.id;

        if (content.thumbnail) {
          // console.log("deleting but with thumbnail")
          const file_path = decodeURIComponent(
            content?.thumbnail.split("/o/")[1].split("?")[0]
          );
          await axios.delete(
            `${apiURL}/content/${user_id}/${content_id}/${file_path}`
          );
        } else {
          // console.log("deleting but without thumbnail")
          await axios.delete(`${apiURL}/content/${user_id}/${content_id}`);
        }
      } catch (error) {
        console.error(error);
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
      const response = await axios.post(url, {}, { headers: { "Content-Type": "application/json" }, });

      // Normalize the response before setting state.
      const normalizedContent = normalizeContentDates(response.data.content);
      setContent(normalizedContent);

      await fetchContentData();
    } catch (error) {
      console.error("Error liking/unliking content:", error);
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
      const response = await axios.post(url, {}, { headers: { "Content-Type": "application/json" } });
      
      // Normalize the response before setting state.
      const normalizedContent = normalizeContentDates(response.data.content);
      setContent(normalizedContent);

      await fetchContentData();
    } catch (error) {
      console.error("Error bookmarking/unbookmarking content:", error);
    }
  };

  /**
   * handleShare() -> void
   *
   * @description
   * Handles the share action for the content, displaying a pop up window
   * with the option to share the content through email copy the share
   * link to the clipboard.
   *
   * @returns void
   */
  const handleShare = async () => {
    // Check if the user is logged in via AuthProvider
    if (!userUID) {
      console.error("User is not authenticated");
      alert("Please log in to share this article.");
      return;
    }

    // Use Firestore user data if available, otherwise fallback
    const username = user?.username || user?.firstName || user?.email || "Summarizz User"; // Fallback Username
    const shareMessage = `${username} invites you to read this article! ${window.location.href}\nJoin Summarizz today!`;
    const shareOption = window.prompt(
      "How do you want to share?\nType '1' to Copy to Clipboard\nType '2' to Share via Email"
    );

    if (shareOption === "1") {
      try {
        await navigator.clipboard.writeText(shareMessage);
        alert("Message copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy the message. Please try again.");
      }
    } else if (shareOption === "2") {
      window.location.href = `mailto:?subject=Check out this article&body=${encodeURIComponent(
        shareMessage
      )}`;
    } else {
      alert("Invalid option. Please choose '1' or '2'.");
      return;
    }

    // Call the share endpoint.
    try {
      const contentId = id;
      const userId = userUID;
      const shareResponse = await axios.post(`${apiURL}/content/user/${userId}/share/${contentId}`);
      console.log("Shared content response:", shareResponse.data.content);
      // Option 1: Update state from response then re-fetch full content.
      setContent(shareResponse.data.content);
      await fetchContentData();
      // Option 2: Redirect to the user's profile page.
      // router.push(`/profile/${userUID}`);
     
      console.log("Content shared successfully");  
    } catch (error) {
      console.error("Error sharing content:", error);
      alert("Failed to share content. Please try again."); 
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
  
      await axios.post(
        url,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      // After following/unfollowing, re-fetch the creator info.
      const creatorResponse = await axios.get(`${apiURL}/user/${content.creatorUID}`);
      setCreator(creatorResponse.data);
  
      // Also fetch the logged in user info, as their follow list has changed.
      fetchLoggedInUser();
  
    } catch (error) {
      console.error("Error following/unfollowing creator:", error);
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

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Layout>
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
              {/* Future: Discussion/Chat */}
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
                    className={`icon-button ${isLiked ? "liked" : ""}`}
                    onClick={handleLike}
                    title={isLiked ? "Unlike Content" : "Like Content"}
                  >
                    {isLiked ? (
                      <HeartIconSolid className='icon' />
                    ) : (
                      <HeartIconOutline className='icon ' />
                    )}
                    <span className={`icon counter ${likes > 0 ? "visible" : ""}`}>
                      {likes}
                    </span>
                  </button>

                  {/* BOOKMARK BUTTON */}
                  <button
                    className={`icon-button ${isBookmarked ? "bookmarked" : ""}`}
                    onClick={handleBookmark}
                    title={
                      isBookmarked ? "Unbookmark Content" : "Bookmark Content"}
                  >
                    {isBookmarked ? (
                      <BookmarkIconSolid className='icon' />
                    ) : (
                      <BookmarkIconOutline className='icon' />
                    )}
                    {content?.bookmarkedBy && (
                      <span
                        className={`icon counter ${bookmarks > 0 ? "visible" : ""}`}
                      >
                        {bookmarks}
                      </span>
                    )}
                  </button>

                  {/* SHARE BUTTON */}
                  <button
                    className='icon-button'
                    onClick={handleShare}
                    title='Share Content'
                  >
                    <ShareIconOutline className='icon' />
                    {content?.shares && (
                      <span
                        className={`icon counter ${content.shares > 0 ? "visible" : ""}`}
                      >
                        {content.shares}
                      </span>
                    )}
                  </button>
                </div>

                {/* EDIT & DELETE (Only for Creator) */}
                {userUID === content?.creatorUID && (
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
                    <div
                      onClick={() => router.push(`/profile/${creator?.uid}`)}
                    >
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
                        title={
                          isFollowing ? "Unfollow Author" : "Follow Author"
                        }
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
      </Layout>
    </>
  );
}
