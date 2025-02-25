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
  const [numComments, setNumComments] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  const hasFetchedData = useRef(false);
  const router = useRouter();

  // EFFECT: Handle Fetching Logged In User
  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchLoggedInUser();
      getContent();
      hasFetchedData.current = true;
    }
  }, []);

  // EFFECT: Handling Fetching Content
  useEffect(() => {
    getUserInfo();
    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content.content);
      setFormatedContent(sanitizedContent);

      const likesCount = typeof content.likes === "number" ? content.likes : 0;
      setLikes(likesCount);

      const userLiked = content.peopleWhoLiked
        ? content.peopleWhoLiked.includes(userUID || "")
        : false;
      setIsLiked(userLiked);

      const userBookmarked = content.bookmarkedBy
        ? content.bookmarkedBy.includes(userUID || "")
        : false;
      setIsBookmarked(userBookmarked);
    }
  }, [content, userUID]);

  /**
   * getContent() -> void
   *
   * @description
   * Fetches content from the backend using the id provided in the route, this
   * will fetch { datecreated, creatorUID, title, content, thumbnail, readtime,
   * likes, peopleWhoLiked, bookmarkedBy } from the backend and set the content
   * accordingly.
   *
   * @returns void
   */
  const getContent = async () => {
    axios
      .get(`${apiURL}/content/${id}`)
      .then((res) => {
        const fetchedContent = res.data;
        if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
          fetchedContent.dateCreated = new Date(
            fetchedContent.dateCreated.seconds * 1000
          );
        } else {
          fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
        }

        fetchedContent.id = id;

        setContent(fetchedContent);
        if (fetchedContent.bookmarkedBy) {
          setBookmarks(fetchedContent.bookmarkedBy.length);
        } else {
          setBookmarks(0);
        }

        incrementViews();
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  };

  /**
   * getUserInfo() -> void
   *
   * @description
   * Fetches user info from the backend using the creatorUID from the content,
   * this will set the creator accordingly.
   *
   * @returns void
   */
  const getUserInfo = async () => {
    if (content) {
      axios
        .get(`${apiURL}/user/${content.creatorUID}`)
        .then((res) => {
          setCreator(res.data);
        })
        .catch((error) => {
          throw Error("Error fetching user info:", error);
        });
    }
  };

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
      axios
        .get(`${apiURL}/user/${userUID}`)
        .then((res) => {
          setUser(res.data);
        })
        .catch((error) => {
          throw Error("Error fetching logged in user:", error);
        });
    }
  };

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

      const response = await axios.post(
        url,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const updatedContent = response.data.content;
      const updatedLikes =
        typeof updatedContent.likes === "number" ? updatedContent.likes : 0;

      setLikes(updatedLikes);
      setIsLiked(!isLiked);
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

      await axios.post(
        url,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      setIsBookmarked(!isBookmarked);

      await getContent();
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

    // Use Firestore user data if available, otherwise fallback
    const username =
      user?.username ||
      authUser.displayName ||
      authUser.email ||
      "Summarizz User"; // Fallback Username

    const shareMessage = `${username} invites you to read this article! ${window.location.href}\nJoin Summarizz today!`;
    const shareOption = window.prompt(
      "How do you want to share?\nType '1' to Copy to Clipboard\nType '2' to Share via Email"
    );

    if (shareOption === "1") {
      try {
        await navigator.clipboard.writeText(shareMessage);
        incrementShares();
        alert("Message copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy the message. Please try again.");
      }
    } else if (shareOption === "2") {
      window.location.href = `mailto:?subject=Check out this article&body=${encodeURIComponent(
        shareMessage
      )}`;
      incrementShares();
    } else {
      alert("Invalid option. Please choose '1' or '2'.");
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
      setIsFollowing(!isFollowing);
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

  /**
   * incrementShares() -> void
   *
   * @description
   * Increments the number of times the content has been viewed.
   */
  const incrementShares = async () => {
    try {
      await axios.put(`${apiURL}/content/shares/${id}`);
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
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
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

              <div className='stats-col-2'>
                <p>{content?.views ? ` - ${content.views} views` : ""}</p>
                <div className='icon-container'>
                  <div className='icon-button'>
                    <ChatBubbleBottomCenterTextIcon className='icon' />
                    <span
                      className={`icon counter ${
                        numComments > 0 ? "visible" : ""
                      }`}
                    >
                      {numComments}
                    </span>
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

                  <button className='icon-button' onClick={editContent}>
                    <PencilIcon className='icon edit' />
                  </button>

                  <button
                    className='icon-button'
                    onClick={handleShare}
                    title='Share Content'
                  >
                    <ShareIcon className='icon' />
                  </button>

                  <button
                    className='icon-button'
                    onClick={handleDelete}
                    title='Delete Content'
                  >
                    <TrashIcon className='icon delete' />
                  </button>
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
