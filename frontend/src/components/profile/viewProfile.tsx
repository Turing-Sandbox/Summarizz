"use client";

// React & NextJs (Import)
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import axios from "axios";
import { UserPlusIcon, TrashIcon } from "@heroicons/react/24/solid";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { User } from "@/models/User";
import { apiURL } from "@/app/scripts/api";

// Stylesheets
import "@/app/styles/profile/profile.scss";
import Navbar from "../Navbar";

interface ViewProfileProps {
  id: string;
}

export default function ViewProfile({ id }: ViewProfileProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [bookmarkedContents, setBookmarkedContents] = useState<Content[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);
  const [sharedContent, setSharedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"created" | "shared">("created");

  const { userUID } = useAuth(); // Get logged in user's UID
  const router = useRouter();

  // ----------------------------------------
  // ------------ Event Handlers ------------
  // ----------------------------------------
  
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch User Data
          const userResponse = await axios.get(`${apiURL}/user/${id}`);
          const userData = userResponse.data;
          setUser(userData);

          // Fetch User's Created Content
          if (userData?.content) {
              const contentPromises = userData.content.map((contentId: string) => getContent(contentId));
              await Promise.all(contentPromises);
          }
          // Fetch Shared Content (only if sharedContent exists)
          if (userData?.sharedContent) {
              const validSharedContent = await getAndFilterSharedContent(userData.sharedContent);
              setSharedContent(validSharedContent);
          }

          // Check follow status (only if viewing another user's profile)
          if (userUID && userUID !== id) {
              setIsFollowing(userData.followedBy?.includes(userUID));
              setFollowRequested(userData.followRequests?.includes(userUID));
          }

      } catch (error) {
          console.error("Error fetching data:", error);
      } finally {
          setIsLoading(false);
      }
  };

  fetchData();

}, [id, userUID]);


  // Helper function to fetch and filter shared content
  async function getAndFilterSharedContent(contentIds: string[]): Promise<Content[]> {
  const validContent: Content[] = [];

  for (const contentId of contentIds) {
      try {
          const response = await axios.get(`${apiURL}/content/${contentId}`);
          if (response.status === 200) {
              const fetchedContent = response.data;

              // Date conversion
              if (fetchedContent.dateCreated) {
                  if (typeof fetchedContent.dateCreated === 'string') {
                      fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
                  } else if (fetchedContent.dateCreated.seconds) {
                      fetchedContent.dateCreated = new Date(fetchedContent.dateCreated.seconds * 1000);
                  } else if (!(fetchedContent.dateCreated instanceof Date)) {
                      fetchedContent.dateCreated = null;
                  }
              }

              fetchedContent.id = contentId; 
              validContent.push(fetchedContent); 
          }
      } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
              console.log(`Content ID ${contentId} not found, skipping.`);
          } else {
              console.error("Error fetching shared content:", error);
          }
      }
  }

  return validContent; 
  }

  /**
   * getContent() -> void
   *
   * @description
   * Fetches the content from the backend using the content id provided, this
   * will fetch all information regarding the content, including but not limited
   * to{ creatorUID, title, content, thumbnail, dateCreated, readtime, likes,
   * peopleWhoLiked, bookmarkedBy } from the backend and set the content
   * accordingly.
   *
   * @param contentId - The id of the content to fetch
   */
  async function getContent(contentId: string) {
    try{
        const res = await axios.get(`${apiURL}/content/${contentId}`);
        const fetchedContent = res.data;

        if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
            fetchedContent.dateCreated = new Date(
              fetchedContent.dateCreated.seconds * 1000
            );
        } else if (fetchedContent.dateCreated){
             fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
        }

        fetchedContent.id = contentId; // Ensure the ID is set
        setContents((prevContents) => {
          // Prevent duplicates
          if(!prevContents.some(c => c.id === fetchedContent.id)) {
            return [...prevContents, fetchedContent];
          }
          return prevContents;
        });
    } catch (err) {
        console.error("Error in getContent:", err);
    }
  }

  /**
   * handleFollow() -> void
   *
   * @description
   * Handles the follow/unfollow actions for the user, setting the isFollowing
   * state to the opposite of the current state.
   *
   * @returns void
   */
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

  const handleUnshare = async (contentId: string) => {
    if (!userUID) {
      console.error("User not logged in.");
      return;
    }

    try {
      // Make API call to unshare
      await axios.post(`${apiURL}/content/${userUID}/unshare/${contentId}`);

      // Update the UI: Filter out the unshared content
      setSharedContent(prevSharedContent =>
        prevSharedContent.filter(content => content.id !== contentId)
      );
      // Refetch
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);

    } catch (error) {
      console.error("Error unsharing content:", error);
    }
  };

  function renderContentItem(content: Content, index: number) { 
    return ( 
      <div 
        key={content.id || index} 
        className='content-list-item' 
        onClick={() => router.push(`/content/${content.id}`)} 
      > 
        <h3 className='content-item-title'>{content.title}</h3>
         <p>
            {content.dateCreated ? (
                `${content.dateCreated.toLocaleString("en-US", {
                month: "short",
                })} ${content.dateCreated.getDate()}${
                content.readtime ? ` - ${content.readtime} min read` : ""
                }`
            ) : (
                ""
            )}
        </p>  
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
        {/* Unshare Button */}
        {sharedContent.some(sharedItem => sharedItem.id === content.id) && (
            <button
                className="icon-button"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent content item click
                    handleUnshare(content.id);
                }}
                title="Unshare Content"
            >
                <TrashIcon className="icon delete" />
            </button>
          )}
      </div> 
    ); 
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  // ANCHOR - What do we do with this?
  // const handleRequestFollow = async () => {
  //   try {
  //     if (!userUID || !user?.uid) {
  //       console.error("User ID or Target ID not available");
  //       return;
  //     }

  //     const url = `${apiURL}/user/${userUID}/request/${user.uid}`;

  //     await axios.post(url);
  //     setFollowRequested(true); // Set request state

  //     console.log("Follow request sent successfully.");
  //   } catch (error) {
  //     console.error("Error sending follow request:", error);
  //   }
  // };

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
            <div className='username-follow'>
              <h1 className='username'>{user?.username}</h1>
              <button
                className={`icon-button follow ${
                  isFollowing ? "following" : ""
                }`}
                onClick={handleFollow}
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

        {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setTab("created")}
          className={tab === "created" ? "tab-active" : "tab-inactive"}
        >
          Created
        </button>
        <button
          onClick={() => setTab("shared")}
          className={tab === "shared" ? "tab-active" : "tab-inactive"}
        >
          Shared
        </button>
      </div>

      {/* Conditionally Render the Created vs Shared Section */}
      {tab === "created" && (
        <>
          <h2 className="section-title">
            {contents.length === 1 ? "Content" : "Contents"}
          </h2>
          {contents.length === 0 ? (
            <h3>No content found</h3>
          ) : (
            <div className="content-list">
              {contents.map((content, index) => renderContentItem(content, index))}
            </div>
          )}
        </>
      )}

      {tab === "shared" && (
        <>
          <h3 className="section-title">Shared Content</h3>
          {sharedContent.length === 0 ? (
            <h4>No shared content found</h4>
          ) : (
            <div className="content-list">
              {sharedContent.map((content, index) => renderContentItem(content, index))}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
