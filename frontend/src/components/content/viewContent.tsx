"use client";

// React & NextJs
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries
import axios from "axios";
import DOMPurify from "dompurify";
import {
  BookmarkIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
  UserPlusIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";

// Local Components & Hooks
import { useAuth } from "@/hooks/AuthProvider";

// Models & Utils
import { User } from "@/models/User";
import { Content } from "../../models/Content";
import { apiURL } from "@/app/scripts/api";

// Styles
import "@/app/styles/content/viewContent.scss";

import { redirect } from "next/navigation";
import { Comment } from "@/models/Comment";
import CommentList from "@/components/content/CommentList";
import Navbar from "../Navbar";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // useAuth Hook for Authentication
  const { userUID, user: authUser } = useAuth();
  const router = useRouter();

  // ---------------------------------------
  // ---------------- State ----------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [formatedContent, setFormatedContent] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState(0);
  const [views, setViews] = useState(0);
  const [numComments, setNumComments] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ---------------------------------------
  // -------------- Helpers --------------
  // ---------------------------------------

  // Normalizes date fields so they're proper Date objects.
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

   // Fetches the content data and, if available, its creator data.
   const fetchContentData = async () => {
    try {
      const contentResponse = await axios.get(`${apiURL}/content/${id}`);
      let fetchedContent = contentResponse.data;

      // Normalize dates.
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

      // Increment views on initial load.
      await incrementViews();
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
          const file_path = decodeURIComponent(
            content?.thumbnail.split("/o/")[1].split("?")[0]
          );
          await axios.delete(
            `${apiURL}/content/${user_id}/${content_id}/${file_path}`
          );
        } else {
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
      // Optionally re-fetch to ensure full data is up-to-date.
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
      // Optionally re-fetch to ensure full data is up-to-date.
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
    if (!authUser) {
      console.error("User is not authenticated");
      alert("Please log in to share this article.");
      return;
    }
  
    const username = user?.username || authUser.displayName || authUser.email || "Summarizz User"; // Fallback Username
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
      const userId = authUser.uid;
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

        //Also fetch the logged in user info, as their follow list has changed.
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
    if (content?.creatorUID === userUID) {
        router.push(`edit/${content?.id}`);
    } else {
        console.error("You cannot edit this content");
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

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------

  return (
    <>
      <Navbar />
      <div className='main-content'>
        <div className='row'>
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
            <CommentList setNumComments={setNumComments} />
          </div>

          <div className='col-2'>
            <h1>{content?.title}</h1>

            <div className='content-header'>
              <div className='content-info'>
                <p>
                  {content?.dateCreated ? (
                      <>
                          {content.dateCreated.toLocaleDateString("en-US", {
                              month: "short",
                          })}{" "}
                          {content.dateCreated.getDate()}
                          {content.readtime ? ` - ${content.readtime} min read` : ""}
                      </>
                  ) : (
                      "" // Or "Date Not Available", or other placeholder
                  )}
                </p>
                <div className='username-follow'>
                  <p className='username'>{creator?.username}</p>
                  <button
                    className={`icon-button ${isFollowing ? "following" : ""}`}
                    onClick={handleFollow}
                    title={isFollowing ? "Unfollow Author" : "Follow Author"}
                  >
                    <UserPlusIcon
                      className={`icon ${isFollowing ? "following" : ""}`}
                      style={{
                        color: isFollowing ? "black" : "#7D7F7C",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                  </button>
                </div>

                {creator?.profileImage && (
                  <Image
                    src={creator.profileImage}
                    width={50}
                    height={50}
                    alt='Profile Picture'
                  />
                )}
              </div>

              <div className="stats-col-2">
                <p>
                  {content?.views ? ` ${content.views} views` : ""}
                </p>
                <div className="icon-container">


                  <div className="icon-button">
                    <ChatBubbleBottomCenterTextIcon className="icon" />
                    <span className={`icon counter ${numComments > 0 ? "visible" : ""}`}>{numComments}</span>
                  </div>

                  <button
                    className={`icon-button ${isLiked ? "liked" : ""}`}
                    onClick={handleLike}
                    title={isLiked ? "Unlike Content" : "Like Content"}
                  >
                    <HeartIcon className={`icon ${isLiked ? "liked" : ""}`} />
                    <span
                      className={`icon counter ${likes > 0 ? "visible" : ""}`}
                    >
                      {likes}
                    </span>
                  </button>

                  <button
                    className={`icon-button ${
                      isBookmarked ? "bookmarked" : ""
                    }`}
                    onClick={handleBookmark}
                    title={
                      isBookmarked ? "Unbookmark Content" : "Bookmark Content"
                    }
                  >
                    <BookmarkIcon
                      className={`icon ${isBookmarked ? "bookmarked" : ""}`}
                    />
                    {content?.bookmarkedBy ? (
                      <span
                        className={`icon counter ${
                          bookmarks > 0 ? "visible" : ""
                        }`}
                      >
                        {bookmarks}
                      </span>
                    ) : (
                      <></>
                    )}
                  </button>

                  {userUID === content?.creatorUID ?
                    <button className="icon-button" onClick={editContent} title="Edit Content">
                      <PencilIcon className="icon edit" />
                    </button>
                    : <></>}

                  <button
                    className='icon-button'
                    onClick={handleShare}
                    title='Share Content'
                  >

                    <ShareIcon className="icon" />
                    {content?.shares ?
                      <span className={`icon counter ${content.shares > 0 ? "visible" : ""}`}>{content.shares}</span>
                      : <></>}
                  </button>

                  {userUID === content?.creatorUID ?

                    <button
                      className="icon-button"
                      onClick={handleDelete}
                      title="Delete Content"
                    >
                      <TrashIcon className="icon delete" />
                    </button>
                    : <></>}

                </div>
              </div>
              <div className='spliter'></div>

              <div className='content-summary'>
                <p>Article Summary</p>
              </div>
            </div>
            {formatedContent ? (
              <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
}
