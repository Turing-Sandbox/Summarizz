import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { apiURL } from "../../scripts/api";
import axios from "axios";

import { UserPlusIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Content } from "../../models/Content";
import ContentPreviewPopup from "../../components/content/ContentPreviewPopup";
import ContentTile from "../../components/content/ContentTile";
import { User } from "../../models/User";

export default function Profile() {
  const { id } = useParams();
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [contents, setContents] = useState<Content[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);
  const [sharedContent, setSharedContent] = useState<Content[]>([]);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"created" | "shared">("created");
  const [followUsernames, setFollowUsernames] = useState<{
    [userId: string]: string;
  }>({}); // Cache for usernames

  const [user, setUser] = useState<User | null>(null); // User data

  const auth = useAuth();

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
        if (userData?.uid && userData.uid !== id) {
          setIsFollowing(userData.followers?.includes(userData.uid) || false);
          setFollowRequested(
            userData.followRequests?.includes(userData.uid) || false
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    console.log("Fetching data for user ID:", id);

    console.log("User ID:", id);
    console.log("Auth Content Length:", auth.user?.content?.length);

    fetchData();
  }, [id]);

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
        } catch {
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

          // Inject user (author) info
          try {
            const userRes = await axios.get(
              `${apiURL}/user/${fetchedContent.creatorUID}`
            );
            fetchedContent.user = userRes.data;
          } catch {
            console.error(
              "Failed to fetch author for shared content:",
              contentId
            );
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

      // Inject user (author) info
      try {
        const userRes = await axios.get(
          `${apiURL}/user/${fetchedContent.creatorUID}`
        );
        fetchedContent.user = userRes.data;
      } catch {
        console.error("Failed to fetch author for content:", contentId);
      }

      fetchedContent.uid = contentId; // Ensure the ID is set
      setContents((prevContents) => {
        // Prevent duplicates
        if (!prevContents.some((c: Content) => c.uid === fetchedContent.uid)) {
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
    if (!auth.isAuthenticated) {
      alert("Please log in to follow users.");
      return;
    }

    if (!user) {
      // Defensive check
      console.error("User data not available.");
      return;
    }

    if (user.uid === id) {
      alert("You can't follow yourself.");
      return;
    }

    try {
      let url = "";

      if (isFollowing) {
        // Unfollow
        url = `${apiURL}/user/${user.uid}/unfollow/${id}`;
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
          url = `${apiURL}/user/${user.uid}/request/${id}`;
        }
      } else {
        // Public profile: Follow directly
        url = `${apiURL}/user/${user.uid}/follow/${id}`;
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

          if (user.uid != user.uid) {
            await axios.post(`${apiURL}/notifications/create`, {
              userId: user.uid,
              notification: {
                userId: user.uid,
                type: "follow",
                textPreview: `You've gained one new follower!`,
                timestamp: Date.now(),
                read: false,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error handling follow/request:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUnshare = async (contentId: string) => {
    if (!auth.isAuthenticated) {
      alert("Please log in.");
      return;
    }

    if (!user) {
      console.error("User data not available.");
      return;
    }

    if (user.uid === id) {
      alert("You can't share your own content.");
      return;
    }

    try {
      // Make API call to unshare
      await axios.post(
        `${apiURL}/content/${contentId}/user/${user.uid}/unshare`
      );

      // Update the UI: Filter out the unshared content
      setSharedContent((prevSharedContent) =>
        prevSharedContent.filter((content) => content.uid !== contentId)
      );
    } catch (error) {
      console.error("Error unsharing content:", error);
    }
  };

  // Approve Follow Request
  const handleApproveRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/approve/${requesterId}`);
    } catch {
      alert("Failed to approve follow request. Please try again.");
    }
  };

  // Reject Follow Request
  const handleRejectRequest = async (requesterId: string) => {
    try {
      await axios.post(`${apiURL}/user/${id}/reject/${requesterId}`);
    } catch {
      alert("Failed to reject follow request. Please try again.");
    }
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------

  const followersCount = user?.followers ? user.followers.length : 0;
  const followingCount = user?.following ? user.following.length : 0;
  const createdCount = user?.content ? user.content.length : 0;
  const sharedCount = user?.sharedContent ? user.sharedContent.length : 0;

  const canViewFullProfile =
    !user?.isPrivate ||
    user.uid === id ||
    (user.uid && user?.followers?.includes(user.uid));

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

  const openPreview = (content: Content) => {
    setPreviewContent(content);
  };

  const closePreview = () => {
    setPreviewContent(null);
  };

  if (!user) {
    return;
  }
  return (
    <>
      <div className='main-content'>
        {!user && !isLoading ? (
          <h1>User not found</h1>
        ) : (
          <div>
            <div className='profile-banner'>
              <div className='profile-banner-image'>
                {user && user.profileImage ? (
                  <img
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
                  {user.uid !== id && ( // Don't show button if viewing own profile
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
                          ? "Request to Follow"
                          : "Follow User"
                      }
                    >
                      <UserPlusIcon
                        className={`icon follow ${
                          isFollowing || followRequested ? "following" : ""
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
            {user.uid === id &&
              user?.followRequests &&
              user.followRequests.length > 0 && (
                <div className='follow-requests-section'>
                  <h3>Follow Requests</h3>
                  <ul>
                    {user.followRequests.map((requesterId) => (
                      <li key={requesterId}>
                        <span>
                          {followUsernames[requesterId] || "Loading..."}
                        </span>
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
                        onPreview={(c) => openPreview(c)} // Pass the content to the preview function
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
                          onPreview={(c) => openPreview(c)}
                          deleteShareOption={
                            sharedContent.some(
                              (sharedItem) => sharedItem.uid === content.uid
                            ) && user.uid === id
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
            {previewContent && (
              <ContentPreviewPopup
                content={previewContent}
                onClose={closePreview}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
