import { useEffect, useState } from "react";
import { Content } from "../models/Content";
import { User } from "../models/User";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { apiURL } from "../scripts/api";
import ContentTile from "../components/content/ContentTile";
import ContentPreviewPopup from "../components/content/ContentPreviewPopup";
import { normalizeContentDates } from "../utils/contentHelper";

export default function Feed() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [latestContent, setLatestContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [creatorProfiles, setCreatorProfiles] = useState<User[]>([]);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorPersonalized, setErrorPersonalized] = useState<string | null>(
    null
  );
  const [errorCreators, setErrorCreators] = useState<string | null>(null);

  useEffect(() => {
    console.log("Auth state:", auth.isAuthenticated, auth.user);
    if (auth.isAuthenticated !== undefined) {
      setAuthLoading(false); // Auth state is initialized
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    // Function to reload the Mondiad script (ADS)
    const reloadMondiadScript = () => {
      const existingScript = document.querySelector(
        "script[src='https://ss.mrmnd.com/native.js']"
      );
      if (existingScript) {
        // Remove the existing script
        existingScript.remove();
      }

      // Create a new script element
      const script = document.createElement("script");
      script.src = "https://ss.mrmnd.com/native.js";
      script.async = true;

      // Append the script to the document head
      document.head.appendChild(script);
    };

    // Reload the script whenever the component renders
    reloadMondiadScript();
  }, [trendingContent, personalizedContent, latestContent]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading and user to be available

    const fetchContent = async () => {
      setIsLoading(true);

      setErrorTrending(null);
      setErrorLatest(null);
      setErrorPersonalized(null);
      setErrorCreators(null);

      // Fetch content, after user is verified as logged in
      const latestFetched = await fetchLatestContent();
      const trendingFetched = await fetchTrendingContent();
      const personalizedFetched = await fetchPersonalizedContent();
      let creatorsFetched = false;

      // Only fetch related creators if we have a user
      if (auth.user?.uid) {
        creatorsFetched = await fetchRelatedCreators();
      }

      setUser(auth.user);

      if (!latestFetched) {
        setErrorLatest(
          "Failed to fetch latest content. Please reload the page or contact support."
        );
      }

      if (!trendingFetched) {
        setErrorTrending(
          "Failed to fetch trending content. Please reload the page or contact support."
        );
      }

      if (!personalizedFetched) {
        setErrorPersonalized(
          "Failed to fetch personalized content. Please reload the page or contact support."
        );
      }

      if (auth.user?.uid && !creatorsFetched) {
        setErrorCreators(
          "Failed to fetch related creators. Please reload the page or contact support."
        );
      }

      setIsLoading(false);
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, auth.user]);

  useEffect(() => {
    setUser(auth.user);
  }, [auth.user]);

  async function fetchTrendingContent(): Promise<boolean> {
    try {
      const trendingResponse = await axios.get(
        `${apiURL}/content/feed/trending`,
        { timeout: 5000 }
      );

      if (trendingResponse.data && trendingResponse.data.success) {
        const normalizedContent = trendingResponse.data.trendingContent.map(
          (content: Content) => normalizeContentDates(content)
        );

        const withAuthors = await Promise.all(
          normalizedContent.map(attachUserData)
        );
        setTrendingContent(withAuthors);
        console.log("Trending content:", normalizedContent);
        return true;
      } else {
        setTrendingContent([]);
      }
    } catch {
      setTrendingContent([]);
    }

    return false;
  }

  async function fetchLatestContent(): Promise<boolean> {
    try {
      const contentResponse = await axios.get(`${apiURL}/content`, {
        timeout: 5000,
      });

      if (contentResponse.data && contentResponse.data.success) {
        const latestContent = contentResponse.data.content.map(
          (content: Content) => normalizeContentDates(content)
        );

        const withAuthors = await Promise.all(
          latestContent.map(attachUserData)
        );
        setLatestContent(withAuthors);
        console.log("Latest content:", latestContent);
        return true;
      } else {
        setLatestContent([]);
      }
    } catch {
      setLatestContent([]);
    }

    return false;
  }

  async function fetchPersonalizedContent(): Promise<boolean> {
    if (!auth.user?.uid) {
      setPersonalizedContent([]);
      return false;
    }

    try {
      const personalizedResponse = await axios.get(
        `${apiURL}/content/feed/${auth.user.uid}`,
        { timeout: 5000, withCredentials: true }
      );

      if (personalizedResponse.data && personalizedResponse.data.success) {
        const normalizedContent =
          personalizedResponse.data.personalizedContent.map(
            (content: Content) => normalizeContentDates(content)
          );

        const withAuthors = await Promise.all(
          normalizedContent.map(attachUserData)
        );
        setPersonalizedContent(withAuthors);
        return true;
      } else {
        setPersonalizedContent([]);
      }
    } catch {
      setPersonalizedContent([]);
    }
    return false;
  }

  async function fetchRelatedCreators(): Promise<boolean> {
    if (!auth.user?.uid) {
      setCreatorProfiles([]);
      return false;
    }

    try {
      const creatorsResponse = await axios.get(
        `${apiURL}/content/feed/creators/${auth.user.uid}`,
        { timeout: 8000 }
      );

      if (creatorsResponse.data && creatorsResponse.data.success) {
        const creatorIds = creatorsResponse.data.relatedCreators || [];

        if (creatorIds.length === 0) {
          setCreatorProfiles([]);
          return false;
        }

        // Profiles for each creator
        const profiles = await Promise.all(
          creatorIds.map(async (creatorId: string) => {
            try {
              const userResponse = await axios.get(
                `${apiURL}/user/${creatorId}`,
                { timeout: 5000 }
              );
              if (userResponse.data) {
                return userResponse.data;
              }
              return null;
            } catch {
              console.error(
                `Failed to fetch user profile for ID: ${creatorId}`
              );
              return null;
            }
          })
        );

        // Filter null profiles or profiles that don't exist
        const validProfiles = profiles.filter((profile) => profile !== null);
        console.log("Valid creator profiles:", validProfiles);

        if (validProfiles.length > 0) {
          setCreatorProfiles(validProfiles);
          return true;
        } else {
          setCreatorProfiles([]);
          return false;
        }
      } else {
        setCreatorProfiles([]);
      }
    } catch {
      setCreatorProfiles([]);
    }
    return false;
  }

  async function attachUserData(content: Content): Promise<Content> {
    if (!content.creatorUID) {
      return content;
    }

    try {
      const userRes = await axios.get(`${apiURL}/user/${content.creatorUID}`);
      content.user = userRes.data;
    } catch {
      console.error(`Failed to fetch author for content ID: ${content.uid}`);
    }
    return content;
  }

  const openPreview = (content: Content) => {
    setPreviewContent(content);
  };

  const closePreview = () => {
    setPreviewContent(null);
  };

  return (
    <div className='main-content'>
      {user && <h1>Welcome, {user.firstName}</h1>}

      {/* Trending Content Section */}
      <h2 className='feed-section-h2'>Top Trending</h2>
      {isLoading ? (
        <div className='content-list-horizontal'>
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
        </div>
      ) : trendingContent.length === 0 ? (
        <h3>No trending content found</h3>
      ) : (
        <div className='content-list-horizontal'>
          {trendingContent.map((content, index) => (
            <div key={`trending-${content.uid || index}`}>
              {index % 8 === 2 ? (
                <div className='ad-tile' key={`ad-trending-${index}`}>
                  <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                </div>
              ) : (
                <ContentTile
                  key={`content-trending-${content.uid || index}`}
                  content={content}
                  index={index}
                  onPreview={(c) => openPreview(c)}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {errorTrending && <p className='error'>{errorTrending}</p>}

      {/* Latest Content Section */}
      <h2 className='feed-section-h2'>Latest Post</h2>
      {isLoading ? (
        <div className='content-list-horizontal'>
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
          <div className='loading-tile' />
        </div>
      ) : latestContent.length === 0 ? (
        <h3>No latest content found</h3>
      ) : (
        <div className='content-list-horizontal'>
          {latestContent.map((content, index) => (
            <ContentTile
              key={content.uid || index}
              content={content}
              index={index}
              onPreview={(c) => openPreview(c)}
            />
          ))}
        </div>
      )}
      {errorLatest && <p className='error'>{errorLatest}</p>}

      {user && (
        <div>
          {/* Related Creators Section */}
          <h2 className='feed-section-h2'>Creators You Might Like</h2>
          {isLoading ? (
            <div className='creator-profiles-list'>
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
            </div>
          ) : creatorProfiles.length === 0 ? (
            <h3>No related creators found</h3>
          ) : (
            <div className='related-creators-section'>
              <div className='creator-profiles-list'>
                {creatorProfiles.map((creator) => (
                  <div
                    key={creator.uid}
                    className='creator-profile-card'
                    onClick={() => navigate(`/profile/${creator.uid}`)}
                  >
                    {creator.profileImage ? (
                      <img
                        src={creator.profileImage}
                        alt={creator.username}
                        width={80}
                        height={80}
                        className='creator-profile-image'
                      />
                    ) : (
                      <div className='creator-profile-placeholder'>
                        {creator.firstName?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className='creator-profile-info'>
                      <span className='creator-username'>
                        @{creator.username}
                      </span>
                      <span className='creator-name'>
                        {creator.firstName} {creator.lastName}
                      </span>
                      <span className='creator-followers'>
                        {creator.followers?.length || 0} followers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errorCreators && <p className='error'>{errorCreators}</p>}

          {/* Personalized Content Section */}
          <h2 className='feed-section-h2'>Content For You</h2>
          {isLoading ? (
            <div className='content-list'>
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
              <div className='loading-tile' />
            </div>
          ) : personalizedContent.length === 0 ? (
            <h3>No content found</h3>
          ) : (
            <div className='content-list'>
              {personalizedContent.map((content, index) => (
                <div key={`personalized-${content.uid || index}`}>
                  {index % 8 === 0 ? (
                    <div className='ad-tile' key={`ad-personalized-${index}`}>
                      <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                    </div>
                  ) : (
                    <ContentTile
                      key={`content-personalized-${content.uid || index}`}
                      content={content}
                      index={index}
                      onPreview={(c) => openPreview(c)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {errorPersonalized && <p className='error'>{errorPersonalized}</p>}
        </div>
      )}
      {previewContent && (
        <ContentPreviewPopup content={previewContent} onClose={closePreview} />
      )}
    </div>
  );
}
