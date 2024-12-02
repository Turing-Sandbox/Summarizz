"use client";

import Navbar from "@/app/components/Navbar";
import { useEffect, useRef, useState } from "react";
import { apiURL } from "@/app/scripts/api";
import { Content } from "../models/Content";
import axios from "axios";
import { User } from "@/app/profile/models/User";
import Image from "next/image";
import "../styles/viewContent.scss";
import DOMPurify from "dompurify";
import { useAuth } from "@/app/hooks/AuthProvider";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/24/solid";

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

  const { userUID } = useAuth(); // Get logged in user's UID
  
  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!hasFetchedData.current) {
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

      const likesCount = typeof content.likes === 'number' 
      ? content.likes 
      : 0;
   
      setLikes(likesCount);
      
      const userLiked = content.peopleWhoLiked 
        ? content.peopleWhoLiked.includes(userUID || "") 
        : false;
      
      setIsLiked(userLiked);

      // Check if the content is bookmarked by the user
      const userBookmarked = content.bookmarkedBy 
        ? content.bookmarkedBy.includes(userUID || "") 
        : false;

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
                <p>{creator?.username}</p>

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
                >
                  <HeartIcon className={`icon ${isLiked ? "liked" : ""}`} />
                  <span className={`icon counter ${likes > 0 ? "visible" : ""}`}>{likes}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  className={`icon-button ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <BookmarkIcon className={`icon ${isBookmarked ? "bookmarked" : ""}`} />
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
