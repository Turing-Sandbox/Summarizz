"use client";

import { useEffect, useRef, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import axios from "axios";

import AuthProvider, { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import DOMPurify from "dompurify";
import { Content } from "@/models/Content";
import { User } from "@/models/User";

import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import CommentList from "@/components/content/CommentList";
import Footer from "@/components/Footer";

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
  const [views, setViews] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [firstRender, setFirstRender] = useState(true); // Used to determine whether to increment the view count on rerenders or not.

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
        setBookmarks(fetchedContent.bookmarkedBy?.length || 0);

        setViews(fetchedContent.views);

        if (firstRender) {
          // Only increment the view count on the first page load, and not rerenders.
          incrementViews()
            .then(() => {
              setViews((fetchedContent.views || 0) + 1);
            })
            .catch((error) => {
              console.error("Failed to increment views:", error);
            })
            .finally(() => {
              setFirstRender(false);
            });
        }
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

      throw error;
    }
  };

  /**
   * incrementShares() -> void
   *
   * @description
   * Increments the number of times the content has been shared.
   */
  const incrementShares = async () => {
    try {
      await axios.put(`${apiURL}/content/shares/${id}`);
      await getContent();
    } catch (error) {
      console.error(error);
      throw error;
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

            <div className='col-2'>
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
                    <span
                      className={`icon counter ${likes > 0 ? "visible" : ""}`}
                    >
                      {likes}
                    </span>
                  </button>

                  {/* BOOKMARK BUTTON */}
                  <button
                    className={`icon-button ${
                      isBookmarked ? "bookmarked" : ""
                    }`}
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

                    {content?.bookmarkedBy && (
                      <span
                        className={`icon counter ${
                          bookmarks > 0 ? "visible" : ""
                        }`}
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
                        className={`icon counter ${
                          content.shares > 0 ? "visible" : ""
                        }`}
                      >
                        {content.shares}
                      </span>
                    )}
                  </button>
                </div>

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
                    {/* CLICK IMAGE TO NAVIGATE TO PROFILE */}
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
              {formatedContent ? (
                <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
