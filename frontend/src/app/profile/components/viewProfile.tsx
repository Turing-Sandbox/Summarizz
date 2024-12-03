"use client";

import Navbar from "@/app/components/Navbar";
import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "../styles/profile.scss";
import { Content } from "@/app/content/models/Content";
import { User } from "../models/User";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthProvider";
import { UserPlusIcon } from "@heroicons/react/24/solid";

interface ViewProfileProps {
  id: string;
}

export default function ViewProfile({ id }: ViewProfileProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);

  const { userUID } = useAuth(); // // Get logged in user's UID

  const router = useRouter();

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Fetch user data on page load
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!hasFetchedData.current) {
      getUserInfo(id);
      hasFetchedData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  function getUserInfo(userId: string = id) {
    axios.get(`${apiURL}/user/${userId}`).then((res) => {
      setUser(res.data);

      if (res.data?.content) {
        for (let i = 0; i < res.data.content.length; i++) {
          getContent(res.data.content[i]);
        }
      }

      if (userUID) {
        setIsFollowing(res.data.followedBy?.includes(userUID)); // Logged-in user is following
        setFollowRequested(res.data.followRequests?.includes(userUID)); // Follow request is pending
      }
    }).catch((error) => {
      console.error("Error fetching user info:", error);
    });
  }


  function getContent(contentId: string) {
    axios.get(`${apiURL}/content/${contentId}`).then((res) => {
      const fetchedContent = res.data;

      // Convert Firestore Timestamp to JavaScript Date
      if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
        fetchedContent.dateCreated = new Date(
          fetchedContent.dateCreated.seconds * 1000
        );
      } else {
        fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
      }

      fetchedContent.id = contentId;
      setContents((prevContents) => [...prevContents, fetchedContent]);
    });
  }

  const handleFollow = async () => {
    try {
      if (!userUID || !user?.uid) {
        console.error("User ID or Target User ID not available");
        return;
      }
  
      if (userUID === user.uid) {
        console.warn("You cannot follow yourself.");
        alert("You can't follow yourself."); 
        return;
      }
  
      // Construct the appropriate URL based on the action
      let url = ""; 
      if (isFollowing) {
        url = `${apiURL}/user/${userUID}/unfollow/user/${user.uid}`; // Unfollow
      } else if (user?.isPrivate && !isFollowing) {
        url = `${apiURL}/user/${userUID}/request/${user.uid}`; // Follow Request for private accounts
      } else {
        url = `${apiURL}/user/${userUID}/follow/user/${user.uid}`; // Follow for public accounts
      }
  
      await axios.post(url);
      
      // Update state based on the action
      if (isFollowing) {
        setIsFollowing(false); // Unfollowed
      } else if (user?.isPrivate) {
        setFollowRequested(true); // Follow request sent
      } else {
        setIsFollowing(true); // Followed
      }
  
      console.log(`Action performed successfully.`);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  const handleRequestFollow = async () => {
    try {
      if (!userUID || !user?.uid) {
        console.error("User ID or Target ID not available");
        return;
      }
  
      const url = `${apiURL}/user/${userUID}/request/${user.uid}`;
  
      await axios.post(url);
      setFollowRequested(true); // Set request state
  
      console.log("Follow request sent successfully.");
    } catch (error) {
      console.error("Error sending follow request:", error);
    }
  }; 


  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Navbar />
      <div className='main-content'>
        <div className='profile-banner'>
          <div className='profile-banner-image'>
            {user && user.profileImage ? (
              <Image
                src={user.profileImage}
                width={200}
                height={200}
                alt='Profile Picture'
                className='profile-banner-image'
              />
            ) : (
              <h1 className='profile-initial'>
                {user?.username[0].toUpperCase()}
              </h1>
            )}
          </div>

          <div className='profile-banner-info'>
            <div className="username-follow">
              <h1 className="username">{user?.username}</h1>
              <button
                className={`icon-button follow ${isFollowing ? "following" : ""}`}
                onClick={ handleFollow }                
                title={
                  isFollowing
                    ? "Unfollow User"
                    : followRequested
                    ? "Request Sent"
                    : user?.isPrivate
                    ? "Request User"
                    : "Follow User"
                } // Tooltip text
              >
                <UserPlusIcon
                  className={`icon follow ${isFollowing ? "following" : ""}`}
                  style={{
                    color: isFollowing ? "black" : "#7D7F7C", // Black when following
                    width: "16px",
                    height: "16px",
                  }}
                />
              </button>
            </div>
            <p>
              {user?.firstName} {user?.lastName}
            </p>
            <p>{user?.bio}</p>
          </div>
        </div>

        <h2 className='section-title'>
          {" "}
          {contents.length === 1 ? "Content" : "Contents"}{" "}
        </h2>
        {contents.length === 0 ? (
          <h2>No content found</h2>
        ) : (
          <div className='content-list'>
            {contents.map((content, index) => (
              <div
                key={content.id || index}
                className='content-list-item'
                onClick={() => router.push(`/content/${content.id}`)}
              >
                <h3 className='content-item-title'>{content.title}</h3>
                <p>
                  {new Date(content.dateCreated).toLocaleString("en-US", {
                    month: "short",
                  })}{" "}
                  {new Date(content.dateCreated).getDate()}
                  {content.readtime ? ` - ${content.readtime} min read` : ""}
                </p>
                {/* Load thumbnail image from URL */}

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
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
