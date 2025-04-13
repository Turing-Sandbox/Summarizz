"use client";

import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { useEffect, useState } from "react";
import { apiURL } from "./scripts/api";
import axios from "axios";
import { User } from "@/models/User";
import ContentTile from "@/components/content/ContentTile";
import ContentPreviewPopup from "@/components/content/ContentPreviewPopup";
import { useRouter } from "next/navigation";
import Image from "next/image";

import "@/app/styles/feed.scss";

export default function Page() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [latestContent, setLatestContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [relatedCreators, setRelatedCreators] = useState<string[]>([]);
  const [creatorProfiles, setCreatorProfiles] = useState<User[]>([]);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { userUID } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorPersonalized, setErrorPersonalized] = useState<string | null>(null);
  const [errorCreators, setErrorCreators] = useState<string | null>(null);

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
    const fetchContent = async () => {
      setIsLoading(true);

      setErrorTrending(null);
      setErrorLatest(null);
      setErrorPersonalized(null);
      setErrorCreators(null);

      console.log('Fetching data...');
      console.log('User UID:', userUID);

      // Fetch user to determine if we're logged in
      let userFetched = await fetchUser();
      console.log('User fetched:', userFetched, 'User state:', user);

      // Fetch content, after user is verified as logged in
      let latestFetched = await fetchLatestContent();
      let trendingFetched = await fetchTrendingContent();
      let personalizedFetched = await fetchPersonalizedContent();
      let creatorsFetched = false;

      // Only fetch related creators if we have a user
      if (userUID) {
        console.log('Fetching related creators for user:', userUID);
        creatorsFetched = await fetchRelatedCreators();
        console.log('Creator profiles after fetch:', creatorProfiles.length);

      } else {
        console.log('No user UID, skipping related creators fetch');

      }

      setIsLoading(false);
      console.log('Finished fetching data');
      console.log('Creator profiles count:', creatorProfiles.length);
      console.log('Personalized content count:', personalizedContent.length);

      if (!userFetched) {
        setUser(null);
      }

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

      if (userUID && !creatorsFetched) {
        setErrorCreators(
          "Failed to fetch related creators. Please reload the page or contact support."
        );
      }

      setIsLoading(false);
    };

    fetchContent();
  }, [userUID]);

  async function fetchUser(): Promise<boolean> {
    if (!userUID) {
      console.log('No userUID, setting user to null');
      setUser(null);
      return false;
    }
    try {
      console.log('Fetching user data for UID:', userUID);
      const userResponse = await axios.get(`${apiURL}/user/${userUID}`, {
        timeout: 5000,
      });

      if (userResponse.status === 200 || userResponse.status === 201) {
        console.log('User data fetched successfully:', userResponse.data);
        setUser(userResponse.data);
        return true;
      } else {
        console.log('User fetch failed with status:', userResponse.status);
        setUser(null);
      }
    } catch (userError) {
      console.error('Error fetching user:', userError);
      setUser(null);
    }

    return false;
  }

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
        return true;
      } else {
        setTrendingContent([]);
      }
    } catch (trendingError) {
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
        return true;
      } else {
        setLatestContent([]);
      }
    } catch (contentError) {
      setLatestContent([]);
    }

    return false;
  }

  async function fetchPersonalizedContent(): Promise<boolean> {
    if (!userUID) {
      setPersonalizedContent([]);
      return false;
    }

    try {
      const personalizedResponse = await axios.get(
        `${apiURL}/content/feed/${userUID}`,
        { timeout: 5000 }
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
    } catch (personalizedError) {
      setPersonalizedContent([]);
    }
    return false;
  }

  async function fetchRelatedCreators(): Promise<boolean> {
    if (!userUID) {
      console.log('No userUID, skipping related creators fetch');
      setRelatedCreators([]);
      setCreatorProfiles([]);
      return false;
    }

    try {
      console.log('Fetching related creators for user:', userUID);
      console.log('API URL:', `${apiURL}/content/feed/creators/${userUID}`);

      const creatorsResponse = await axios.get(
        `${apiURL}/content/feed/creators/${userUID}`,
        { timeout: 8000 }
      );

      console.log('Related creators response:', creatorsResponse.data);

      if (creatorsResponse.data && creatorsResponse.data.success) {
        const creatorIds = creatorsResponse.data.relatedCreators || [];
        console.log('Creator IDs:', creatorIds);

        if (creatorIds.length === 0) {
          console.log('No related creators found');
          setRelatedCreators([]);
          setCreatorProfiles([]);
          return false;
        }

        setRelatedCreators(creatorIds);

        // Profiles for each creator
        const profiles = await Promise.all(
          creatorIds.map(async (creatorId: string) => {
            try {
              const userResponse = await axios.get(`${apiURL}/user/${creatorId}`, { timeout: 5000 });
              if (userResponse.data) {
                return userResponse.data;
              }
              return null;
            } catch (error) {
              console.error(`Failed to fetch user profile for ID: ${creatorId}`);
              return null;
            }
          })
        );

        // Filter null profiles or profiles that don't exist
        const validProfiles = profiles.filter(profile => profile !== null);
        console.log('Valid creator profiles:', validProfiles);

        if (validProfiles.length > 0) {
          setCreatorProfiles(validProfiles);
          return true;
        } else {
          console.log('No valid profiles found');
          setCreatorProfiles([]);
          return false;
        }
      } else {
        console.log('No success in response or empty data');
        setRelatedCreators([]);
        setCreatorProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching related creators:', error);
      setRelatedCreators([]);
      setCreatorProfiles([]);
    }
    return false;
  }

  function normalizeContentDates(content: Content): Content {
    if (content.dateCreated && (content.dateCreated as any).seconds) {
      content.dateCreated = new Date(
        (content.dateCreated as any).seconds * 1000
      );
    }

    return content;
  }

  async function attachUserData(content: Content): Promise<Content> {
    try {
      const userRes = await axios.get(`${apiURL}/user/${content.creatorUID}`);
      content.user = userRes.data;
    } catch (error) {
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
      {isLoading && <p>Loading...</p>}

      {user ? (
        <h1>Welcome, {user?.firstName}</h1>
      ) : (
        <h1 className='summarizz-logo-container'>
          <span className='summarizz-logo'>SUMMARIZZ</span>
        </h1>
      )}

      <h2>Top Trending</h2>
      <br />
      {trendingContent.length === 0 ? (
        <h3>No content found</h3>
      ) : (
        <div className='content-list-horizontal'>
          {trendingContent.map((content, index) => (
            <div>
              {index % 8 === 2 ? (
                <div className='ad-tile'>
                  <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                </div>
              ) : (
                <ContentTile
                  key={content.uid || index}
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

      {/* <h2>Latest Post</h2>
      {latestContent.length === 0 ? (
        <h3>No content found</h3>
      ) : (
        <div className='content-list'>
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
      {errorLatest && <p className='error'>{errorLatest}</p>} */}


      {user && (
        <div>
          {/* Related Creators Section */}
          {creatorProfiles.length > 0 ? (
            <div className='related-creators-section'>
              <h3>Creators You Might Like</h3>
              <div className='creator-profiles-list'>
                {creatorProfiles.map((creator) => (
                  <div
                    key={creator.uid}
                    className='creator-profile-card'
                    onClick={() => router.push(`/profile/${creator.uid}`)}
                  >
                    {creator.profileImage ? (
                      <Image
                        src={creator.profileImage}
                        alt={creator.username}
                        width={80}
                        height={80}
                        className='creator-profile-image'
                      />
                    ) : (
                      <div className='creator-profile-placeholder'>
                        {creator.firstName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className='creator-profile-info'>
                      <span className='creator-username'>@{creator.username}</span>
                      <span className='creator-name'>{creator.firstName} {creator.lastName}</span>
                      <span className='creator-followers'>{creator.followers?.length || 0} followers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='related-creators-section'>
              <h3>Creators You Might Like</h3>
              <p className='no-creators-message'>Finding creators for you...</p>
            </div>
          )}
          {errorCreators && <p className='error'>{errorCreators}</p>}

          {/* Personalized Content Section */}
          <h2>Content For You</h2>
          <br />

          {personalizedContent.length === 0 ? (
            <h4>No content found</h4>
          ) : (
            <div className='content-list'>
              {personalizedContent.map((content, index) => (
                <div key={content.uid || `content-${index}`}>
                  {index % 8 === 0 ? (
                    <div className='ad-tile'>
                      <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
                    </div>
                  ) : (
                    <ContentTile
                      key={content.uid || index}
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
