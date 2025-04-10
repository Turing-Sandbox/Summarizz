"use client";

// React & NextJs (Import)
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import axios from "axios";
import {
  UserPlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { User } from "@/models/User";
import { apiURL } from "@/app/scripts/api";

// Stylesheets
import "@/app/styles/profile/profile.scss";
import ContentTile from "@/components/content/ContentTile";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Profile page by Id, allowing users to view their profile.
 *
 * @returns JSX.Element
 */
export default function Page() {
  const { id } = useParams();
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);
  const [sharedContent, setSharedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"created" | "shared">("created");
  const [followUsernames, setFollowUsernames] = useState<{
    [userId: string]: string;
  }>({}); // Cache for usernames

  const { userUID } = useAuth(); // Get logged in user's UID
  const router = useRouter();

  // ----------------------------------------
  // ------------ Event Handlers ------------
  // ----------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch User Data
        const userResponse = await axios.get(`${apiURL}/user/${id}`);
        const userData = userResponse.data;
        setUser(userData);

        // 2. Fetch User's Created Content
        if (userData?.content) {
          const contentPromises = userData.content.map((contentId: string) =>
            getContent(contentId)
          );
          await Promise.all(contentPromises);
        }

        // 3. Fetch Shared Content (only if sharedContent exists)
        if (userData?.sharedContent) {
          const validSharedContent = await getAndFilterSharedContent(
            userData.sharedContent
          );
          setSharedContent(validSharedContent);
        }

        // 4. Check follow status (only if viewing another user's profile)
        if (userUID && userUID !== id) {
          setIsFollowing(userData.followers?.includes(userUID));
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

  // Fetch usernames for follow requests
  useEffect(() => {
    if (!user || !user.followRequests) return;

    const followRequests = user.followRequests;

    async function fetchUsernames() {
      const usernamesMap: { [key: string]: string } = {};
      for (const requesterId of followRequests) {
        try {
          const username = await getUsername(requesterId);
          usernamesMap[requesterId] = username;
        } catch (error) {
          usernamesMap[requesterId] = "Unknown User";
        }
      }
      setFollowUsernames(usernamesMap);
    }

    fetchUsernames();
  }, [user]);

  // Helper function to fetch and filter shared content
  async function getAndFilterSharedContent(
    contentIds: string[]
  ): Promise<Content[]> {
    const validContent: Content[] = [];

    for (const contentId of contentIds) {
      try {
        const response = await axios.get(`${apiURL}/content/${contentId}`);
        if (response.status === 200) {
          const fetchedContent = response.data;

          // Date conversion
          if (fetchedContent.dateCreated) {
            if (typeof fetchedContent.dateCreated === "string") {
              fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
            } else if (fetchedContent.dateCreated.seconds) {
              fetchedContent.dateCreated = new Date(
                fetchedContent.dateCreated.seconds * 1000
              );
            } else if (!(fetchedContent.dateCreated instanceof Date)) {
              fetchedContent.dateCreated = null;
            }
          }

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
    try {
      const res = await axios.get(`${apiURL}/content/${contentId}`);
      const fetchedContent = res.data;

      if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
        fetchedContent.dateCreated = new Date(
          fetchedContent.dateCreated.seconds * 1000
        );
      } else if (fetchedContent.dateCreated) {
        fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
      }

      fetchedContent.uid = contentId; // Ensure the ID is set
      setContents((prevContents) => {
        // Prevent duplicates
        if (!prevContents.some((c) => c.uid === fetchedContent.uid)) {
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
    if (!userUID) {
      alert("Please log in to follow users.");
      return;
    }

    if (userUID === id) {
      alert("You can't follow yourself.");
      return;
    }

    if (!user) {
      // Defensive check
      console.error("User data not available.");
      return;
    }

    try {
      let url = "";
      let method = "post";

      if (isFollowing) {
        // Unfollow
        url = `${apiURL}/user/${userUID}/unfollow/${id}`;
      } else if (user.isPrivate) {
        // Private profile: Send request, or cancel if already requested (optional)
        if (followRequested) {
          // cancel request (OPTIONAL: Handle Cancel Request (requires backend endpoint))
          // url = `${apiURL}/user/${userUID}/cancel-request/${id}`;
          // await axios.post(url); // UNCOMMENT WHEN ENDPOINT IS READY
          // setFollowRequested(false); // OPTIONAL: Update local state
          return; // for now
        } else {
          // Send Request
          url = `${apiURL}/user/${userUID}/request/${id}`;
        }
      } else {
        // Public profile: Follow directly
        url = `${apiURL}/user/${userUID}/follow/${id}`;
      }

      // Only make the API call if a URL is set
      if (url) {
        await axios.post(url);

        // Optimistically update the UI *immediately*
        if (isFollowing) {
          setIsFollowing(false); // Just unfollowed
        } else if (user.isPrivate && !followRequested) {
          setFollowRequested(true); // Just sent a request
        } else if (!user.isPrivate) {
          setIsFollowing(true); // Just followed directly

          if (userUID != user.uid) {
            await axios.post(`${apiURL}/notifications/create`,
              {
                userId: user.uid,
                notification: {
                  userId: userUID,
                  type: 'follow',
                  textPreview: `You've gained one new follower!`,
                  timestamp: Date.now(),
                  read: false,
                }
              }
            )
          }

        }
        // Refetch data
        const userResponse = await axios.get(`${apiURL}/user/${id}`);
        setUser(userResponse.data);
      }
    } catch (error) {
      console.error("Error handling follow/request:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUnshare = async (contentId: string) => {
    if (!userUID) {
      console.error("User not logged in.");
      return;
    }

    try {
      // Make API call to unshare
      await axios.post(
        `${apiURL}/content/${contentId}/user/${userUID}/unshare`
      );

      // Update the UI: Filter out the unshared content
      setSharedContent((prevSharedContent) =>
        prevSharedContent.filter((content) => content.uid !== contentId)
      );
      // Refetch
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);
    } catch (error) {
      console.error("Error unsharing content:", error);
    }
  };

  // Approve Follow Request
  const handleApproveRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/approve/${requesterId}`);

      //Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;

        const updatedFollowRequests = prevUser.followRequests?.filter(
          (id) => id !== requesterId
        );
        const updatedFollowers = prevUser.followers
          ? [...prevUser.followers, requesterId]
          : [requesterId];

        return {
          ...prevUser,
          followRequests: updatedFollowRequests,
          followers: updatedFollowers,
        };
      });
      // Refetch user data to be 100% sure
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);

      console.log("Follow request approved successfully.");
    } catch (error) {
      console.error("Error approving follow request:", error);
      alert("Failed to approve follow request. Please try again.");
    }
  };

  // Reject Follow Request
  const handleRejectRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/reject/${requesterId}`);

      // Update local state
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedFollowRequests = prevUser.followRequests?.filter(
          (id) => id !== requesterId
        );

        return {
          ...prevUser,
          followRequests: updatedFollowRequests,
        };
      });
      // Refetch user data to be 100% sure
      const userResponse = await axios.get(`${apiURL}/user/${id}`);
      setUser(userResponse.data);

      console.log("Follow request rejected successfully.");
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      alert("Failed to reject follow request. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------

  const followersCount = user?.followers ? user.followers.length : 0;
  const followingCount = user?.following ? user.following.length : 0;
  const createdCount = user?.content ? user.content.length : 0;
  const sharedCount = user?.sharedContent ? user.sharedContent.length : 0;
  const canViewFullProfile =
    !user?.isPrivate ||
    userUID === id ||
    (userUID && user?.followers?.includes(userUID));

  // Helper function to get username by ID (Simplified)
  async function getUsername(userId: string): Promise<string> {
    try {
      const userResponse = await axios.get(`${apiURL}/user/${userId}`);
      return userResponse.data.username || "Unknown User"; // Provide a fallback
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User"; // Fallback in case of error
    }
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }
  return (
    <>
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
              {/* Follow/Request Button (Conditional Rendering) */}
              {userUID !== id && ( // Don't show button if viewing own profile
                <button
                  className={`icon-button follow ${isFollowing ? "following" : ""
                    }`}
                  onClick={handleFollow}
                  title={
                    isFollowing
                      ? "Unfollow User"
                      : followRequested
                        ? "Request Sent"
                        : user?.isPrivate
                          ? "Request to Follow"
                          : "Follow User"
                  }
                >
                  <UserPlusIcon
                    className={`icon follow ${isFollowing || followRequested ? "following" : ""
                      }`}
                  />
                </button>
              )}
            </div>

            {canViewFullProfile ? (
              <>
                {/* Stats */}
                <div className='profile-stats'>
                  <div className='stat-item'>
                    <span className='stat-number'>{followersCount}</span>
                    <span className='stat-label'>Followers</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{followingCount}</span>
                    <span className='stat-label'>Following</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{createdCount}</span>
                    <span className='stat-label'>Created</span>
                  </div>
                  <div className='stat-item'>
                    <span className='stat-number'>{sharedCount}</span>
                    <span className='stat-label'>Shared</span>
                  </div>
                </div>
              </>
            ) : (
              <p>This account is private.</p>
            )}

            <p>
              {user?.firstName} {user?.lastName}
            </p>
            <p>{user?.bio}</p>
          </div>
        </div>

        {/* Follow Requests Section (Conditional Rendering) */}
        {userUID === id &&
          user?.followRequests &&
          user.followRequests.length > 0 && (
            <div className='follow-requests-section'>
              <h3>Follow Requests</h3>
              <ul>
                {user.followRequests.map((requesterId) => (
                  <li key={requesterId}>
                    <span>{followUsernames[requesterId] || "Loading..."}</span>
                    <div className='request-buttons'>
                      <button
                        className='icon-button approve'
                        onClick={() => handleApproveRequest(requesterId)}
                        title='Approve Request'
                      >
                        <CheckIcon className='icon check' />
                      </button>
                      <button
                        className='icon-button reject'
                        onClick={() => handleRejectRequest(requesterId)}
                        title='Reject Request'
                      >
                        <XMarkIcon className='icon xmark' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Tabs for Created/Shared Content */}
        <div className='tabs'>
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
            <h2 className='section-title'>
              {contents.length === 1 ? "Content" : "Contents"}
            </h2>
            {contents.length === 0 ? (
              <h3>No content found</h3>
            ) : (
              <div className='content-list'>
                {contents.map((content, index) => (
                  <ContentTile
                    key={content.uid || index}
                    content={content}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "shared" && (
          <>
            <h3 className='section-title'>Shared Content</h3>
            {canViewFullProfile ? (
              sharedContent.length === 0 ? (
                <h4>No shared content found</h4>
              ) : (
                <div className='content-list'>
                  {sharedContent.map((content, index) => (
                    <ContentTile
                      key={content.uid || index}
                      content={content}
                      index={index}
                      deleteShareOption={
                        sharedContent.some(
                          (sharedItem) => sharedItem.uid === content.uid
                        ) && userUID === id
                      }
                      handleUnshare={handleUnshare}
                    />
                  ))}
                </div>
              )
            ) : (
              <p>This account is private.</p>
            )}
          </>
        )}
      </div>
    </>
  );
}
