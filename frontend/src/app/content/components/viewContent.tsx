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
import { useAuth } from "@/app/hooks/AuthProvider";
import { HeartIcon, BookmarkIcon, UserPlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { redirect } from "next/navigation";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [formatedContent, setFormatedContent] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false); // Track liked state
  const [likes, setLikes] = useState(0); // Track likes count
  const [isBookmarked, setIsBookmarked] = useState(false); // Track bookmarked state
  const [isFollowing, setIsFollowing] = useState(false); // Track following state
  const [user, setUser] = useState<User | null>(null); // Track logged in user

  // const router = useRouter();
  const { userUID } = useAuth(); // Get logged in user's UID

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------
  const hasFetchedData = useRef(false);
  useEffect(() => {
    console.log("unforced get request: ")
    if (!hasFetchedData.current) {
      fetchLoggedInUser();
      getContent();
      //   getUserInfo();
      hasFetchedData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, userUID]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  function getContent() {
    axios.get(`${apiURL}/content/${id}`).then((res) => {
      const fetchedContent = res.data;
      console.log(fetchedContent)
      console.log("^^^^^^^^^^^^^^")

      // Convert Firestore Timestamp to JavaScript Date
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
        console.log(res.data);
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
        // alert(true)
        console.log("deleting...")
        const user_id = content?.creatorUID;
        const content_id = content?.id;
        if (content.thumbnail) {
          // console.log("deleting but with thumbnail")
          const file_path = decodeURIComponent(content?.thumbnail.split('/o/')[1].split('?')[0]);
          await axios.delete(`${apiURL}/content/${user_id}/${content_id}/${file_path}`).then((res) => {
            // console.log("with thumbnail: " + res.data)
            // alert("with thumbnail: " + res.data)
          })
        } else {
          // console.log("deleting but without thumbnail")
          await axios.delete(`${apiURL}/content/${user_id}/${content_id}`).then((res) => {
            // console.log("without thumbnail: " + res.data)
            // alert("without thumbnail: " + res.data)
          })
        }
        // useNavigate(`/profile/${content.creatorUID}`)
      } catch (error) {
        console.error(error)
        alert(error)
      }
    } else {
      throw Error("You do not have the permission to delete this page.")
    }
    redirect(`/profile/${userUID}`)
  }

  const handleLike = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      // Determine whether to like or unlike the content
      const action = isLiked ? "unlike" : "like";
      const url = `${apiURL}/content/${id}/${action}/${userUID}`;

      // Send the appropriate like/unlike request
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Extract updated content details from the response
      const updatedContent = response.data.content;
      const updatedLikes = typeof updatedContent.likes === 'number' ? updatedContent.likes : 0;

      // Update local state based on the like or unlike action
      setLikes(updatedLikes);
      setIsLiked(!isLiked); // Toggle isLiked state

      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} response:`, updatedContent);

    } catch (error) {
      console.error("Error liking/unliking content:", error);

      // Additional logging for Axios errors
      if ((error as any).response) {
        console.error("Axios Error Response:", {
          data: (error as any).response.data,
          status: (error as any).response.status,
          headers: (error as any).response.headers,
        });
      }
    }
  };

  const handleBookmark = async () => {
    try {
      if (!userUID) {
        console.error("No user ID available");
        return;
      }

      // Determine whether to bookmark or unbookmark the content
      const action = isBookmarked ? "unbookmark" : "bookmark";
      const url = `${apiURL}/content/${userUID}/${action}/${id}`; // mine

      // Send the appropriate bookmark/unbookmark request
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Extract updated content details from the response
      const updatedContent = response.data.content;
      setIsBookmarked(!isBookmarked); // Toggle isBookmarked state

      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} response:`, updatedContent);

    } catch (error) {
      console.error("Error bookmarking/unbookmarking content:", error);

      // Additional logging for Axios errors
      if ((error as any).response) {
        console.error("Axios Error Response:", {
          data: (error as any).response.data,
          status: (error as any).response.status,
          headers: (error as any).response.headers,
        });
      }
    }
  }

  const handleShare = async () => {
    if (!user) {
      console.error("User information is not available");
      alert("Please log in to share this article.")
      return;
    }

    const shareMessage = `${user.username} invites you to read this article! ${window.location.href}\nJoin Summarizz today!`

    const shareOption = window.prompt(
      "How do you want to share?\nType '1' to Copy to Clipboard\nType '2' to Share via Email"
    );

    if (shareOption === "1") {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareMessage);
        alert("Message copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy the message. Please try again.");
      }
    } else if (shareOption === "2") {
      // Open email client
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

      // Determine whether to follow or unfollow the creator
      const action = isFollowing ? "unfollow" : "follow";
      const url = `${apiURL}/user/${userUID}/${action}/${content.creatorUID}`;

      // Send the follow/unfollow request
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update the local state
      setIsFollowing(!isFollowing); // Toggle follow state

      console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} response:`, response.data);

    } catch (error) {
      console.error("Error following/unfollowing creator:", error);

      // Additional logging for Axios errors
      if ((error as any).response) {
        console.error("Axios Error Response:", {
          data: (error as any).response.data,
          status: (error as any).response.status,
          headers: (error as any).response.headers,
        });
      }
    }
  };

  const editContent = () => {
    redirect(`edit/${content?.id}`)
  }
  
  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Navbar />
      <div className='main-content'>
        <div className='row'>
          <div className='col-2'>
            {content && content.thumbnail && (
              <Image
                src={content!.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
                className='thumbnail'
              />
            )}

            {/* TODO: DISCUSSION/CHAT */}
          </div>

          <div className='col-1'>
            <h1>{content?.title}</h1>

            <div className='content-header'>
              <div className='content-info'>
                {/* TODO: TAGS */}
                <p>
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
                </p>

                {/* Username with Follow Icon */}
                <div className="username-follow">
                  <p className="username">{creator?.username}</p>
                  <button
                    className={`icon-button ${isFollowing ? "following" : ""}`}
                    onClick={handleFollow}
                    title={isFollowing ? "Unfollow Author" : "Follow Author"} // Tooltip for clarity
                  >
                    <UserPlusIcon
                      className={`icon ${isFollowing ? "following" : ""}`}
                      style={{
                        color: isFollowing ? "black" : "#7D7F7C", // Black when following
                        width: "16px",
                        height: "16px",
                      }}
                    />
                  </button>
                </div>

                {/* Profile Image */}
                {creator && creator.profileImage && (
                  <Image
                    src={creator.profileImage}
                    width={50}
                    height={50}
                    alt='Profile Picture'
                  />
                )}
              </div>

              <div className="icon-container">
                {/* Like Button */}
                <button
                  className={`icon-button ${isLiked ? "liked" : ""}`}
                  onClick={handleLike}
                  title={isLiked ? "Unlike Content" : "Like Content"}
                >
                  <HeartIcon className={`icon ${isLiked ? "liked" : ""}`}/>
                  <span className={`icon counter ${likes > 0 ? "visible" : ""}`}>{likes}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  className={`icon-button ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={handleBookmark}
                  title={isBookmarked ? "Unookmark Content" : "Bookmark Content"}
                >
                  <BookmarkIcon className={`icon ${isBookmarked ? "bookmarked" : ""}`}/>
                </button>

                {/* Edit Button */}
                <button
                    className={"icon-button"}
                    onClick={editContent}
                >
                  <PencilIcon className={"icon edit"}/>
                </button>

                {/* Share Button */}
                <button
                  className="icon-button"
                  onClick={handleShare}
                  title="Share Content"
                >
                  <ShareIcon className="icon" />
                </button>

                {/* Delete Button */}
                <button
                  className={`icon-button`}
                  onClick={handleDelete}
                  title="Delete Content"
                >
                  <TrashIcon className={`icon delete`}/>
                </button>

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
