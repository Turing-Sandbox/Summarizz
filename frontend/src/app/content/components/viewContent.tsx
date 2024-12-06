"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import { User } from "@/app/profile/models/User";
import { apiURL } from "@/app/scripts/api";
import { BookmarkIcon, HeartIcon, ShareIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import DOMPurify from "dompurify";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Content } from "../models/Content";
import "../styles/viewContent.scss";
import { PencilIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // If viewing content requires auth, uncomment the lines below
  // const { user, loading } = useAuth();
  const { userUID } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [formatedContent, setFormatedContent] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const hasFetchedData = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchLoggedInUser();
      getContent();
      hasFetchedData.current = true;
    }
  }, []);

  useEffect(() => {
    getUserInfo();
    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content.content);
      setFormatedContent(sanitizedContent);

      const likesCount = typeof content.likes === 'number' ? content.likes : 0;
      setLikes(likesCount);

      const userLiked = content.peopleWhoLiked ? content.peopleWhoLiked.includes(userUID || "") : false;
      setIsLiked(userLiked);

      const userBookmarked = content.bookmarkedBy ? content.bookmarkedBy.includes(userUID || "") : false;
      setIsBookmarked(userBookmarked);
    }
  }, [content, userUID]);

  function getContent() {
    axios.get(`${apiURL}/content/${id}`).then((res) => {
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
    }).catch((error) => {
      console.error("Error fetching content:", error);
    });
  }

  function getUserInfo() {
    if (content) {
      axios.get(`${apiURL}/user/${content.creatorUID}`).then((res) => {
        setCreator(res.data);
      }).catch((error) => {
        console.error("Error fetching user info:", error);
      });
    }
  }

  function fetchLoggedInUser() {
    if (userUID) {
      axios.get(`${apiURL}/user/${userUID}`).then((res) => {
        setUser(res.data);
      }).catch((error) => {
        console.error("Error fetching logged in user:", error);
      });
    }
  }

  const handleDelete = async () => {
    if (localStorage.getItem('userUID') === content?.creatorUID) {
      try {
        const user_id = content?.creatorUID;
        const content_id = content?.id;
        if (content?.thumbnail) {
          const file_path = decodeURIComponent(content.thumbnail.split('/o/')[1].split('?')[0]);
          await axios.delete(`${apiURL}/content/${user_id}/${content_id}/${file_path}`);
        } else {
          await axios.delete(`${apiURL}/content/${user_id}/${content_id}`);
        }
      } catch (error) {
        console.error(error);
        alert(error);
      }
    } else {
      alert("You do not have permission to delete this page.");
    }

    // Replace redirect with router.push
    router.push(`/profile/${userUID}`);
  };

  const handleLike = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isLiked ? "unlike" : "like";
      const url = `${apiURL}/content/${id}/${action}/${userUID}`;

      const response = await axios.post(url, {}, {
        headers: { 'Content-Type': 'application/json' },
      });

      const updatedContent = response.data.content;
      const updatedLikes = typeof updatedContent.likes === 'number' ? updatedContent.likes : 0;

      setLikes(updatedLikes);
      setIsLiked(!isLiked);

    } catch (error) {
      console.error("Error liking/unliking content:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      const action = isBookmarked ? "unbookmark" : "bookmark";
      const url = `${apiURL}/content/${userUID}/${action}/${id}`;

      const response = await axios.post(url, {}, { headers: { 'Content-Type': 'application/json' }});
      setIsBookmarked(!isBookmarked);

    } catch (error) {
      console.error("Error bookmarking/unbookmarking content:", error);
    }
  };

  const handleShare = async () => {
    if (!user) {
      console.error("User information is not available");
      alert("Please log in to share this article.");
      return;
    }

    const shareMessage = `${user.username} invites you to read this article! ${window.location.href}\nJoin Summarizz today!`;
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
    }
  };

  const handleFollow = async () => {
    try {
      if (!userUID || !content?.creatorUID) {
        console.error("User ID or Creator ID not available");
        return;
      }

      const action = isFollowing ? "unfollow" : "follow";
      const url = `${apiURL}/user/${userUID}/${action}/${content.creatorUID}`;

      await axios.post(url, {}, { headers: { 'Content-Type': 'application/json' }});
      setIsFollowing(!isFollowing);

    } catch (error) {
      console.error("Error following/unfollowing creator:", error);
    }
  };

  const editContent = () => {
    router.push(`edit/${content?.id}`);
  };

  return (
    <>
      <Navbar />
      <div className='main-content'>
        <div className='row'>
          <div className='col-2'>
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
          </div>

          <div className='col-1'>
            <h1>{content?.title}</h1>

            <div className='content-header'>
              <div className='content-info'>
                <p>
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
                </p>

                <div className="username-follow">
                  <p className="username">{creator?.username}</p>
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

              <div className="icon-container">
                <button
                  className={`icon-button ${isLiked ? "liked" : ""}`}
                  onClick={handleLike}
                  title={isLiked ? "Unlike Content" : "Like Content"}
                >
                  <HeartIcon className={`icon ${isLiked ? "liked" : ""}`} />
                  <span className={`icon counter ${likes > 0 ? "visible" : ""}`}>{likes}</span>
                </button>

                <button
                  className={`icon-button ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={handleBookmark}
                  title={isBookmarked ? "Unbookmark Content" : "Bookmark Content"}
                >
                  <BookmarkIcon className={`icon ${isBookmarked ? "bookmarked" : ""}`} />
                </button>

                <button className="icon-button" onClick={editContent}>
                  <PencilIcon className="icon edit" />
                </button>

                <button
                  className="icon-button"
                  onClick={handleShare}
                  title="Share Content"
                >
                  <ShareIcon className="icon" />
                </button>

                <button
                  className="icon-button"
                  onClick={handleDelete}
                  title="Delete Content"
                >
                  <TrashIcon className="icon delete" />
                </button>
              </div>

              <div className='spliter'></div>

              <div className='content-summary'>
                <p>Article Summary</p>
              </div>
            </div>
            {formatedContent ? (
              <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
            ) : ""}
          </div>
        </div>
      </div>
    </>
  );
}
