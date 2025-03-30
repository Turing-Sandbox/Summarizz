"use client";

import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { useEffect, useState } from "react";
import { apiURL } from "./scripts/api";
import axios from "axios";
import { User } from "@/models/User";
import ContentTile from "@/components/content/ContentTile";
import ContentPreviewPopup from "@/components/content/ContentPreviewPopup";

import "@/app/styles/feed.scss";

export default function Page() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [latestContent, setLatestContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { userUID } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [errorLatest, setErrorLatest] = useState<string | null>(null);
  const [errorPersonalized, setErrorPersonalized] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);

      setErrorTrending(null);
      setErrorLatest(null);
      setErrorPersonalized(null);

      let userFetched = await fetchUser();
      let latestFetched = await fetchLatestContent();
      let trendingFetched = await fetchTrendingContent();
      let personalizedFetched = await fetchPersonalizedContent();

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

      setIsLoading(false);
    };

    fetchContent();
  }, [userUID]);

  async function fetchUser(): Promise<boolean> {
    if (!userUID) {
      setUser(null);
      return false;
    }
    try {
      const userResponse = await axios.get(`${apiURL}/user/${userUID}`, {
        timeout: 5000,
      });

      if (userResponse.status === 200 || userResponse.status === 201) {
        setUser(userResponse.data);
        return true;
      } else {
        setUser(null);
      }
    } catch (userError) {
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
        setTrendingContent(normalizedContent);
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
        const latestContent = contentResponse.data.content;

        const normalizedContent = latestContent.map((content: Content) =>
          normalizeContentDates(content)
        );

        setLatestContent(normalizedContent);
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
        setPersonalizedContent(normalizedContent);
        return true;
      } else {
        setPersonalizedContent([]);
      }
    } catch (personalizedError) {
      setPersonalizedContent([]);
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
      {trendingContent.length === 0 ? (
        <h3>No content found</h3>
      ) : (
        <div className='content-list-horizontal'>
          {trendingContent.map((content, index) => (
            <div>
              {index % 8 === 2 ? (
                <div data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'></div>
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
            />
          ))}
        </div>
      )}
      {errorLatest && <p className='error'>{errorLatest}</p>} */}

      {user && (
        <div>
          <h2>For You</h2>
          {personalizedContent.length === 0 ? (
            <h3>No content found</h3>
          ) : (
            <div className='content-list'>
              {personalizedContent.map((content, index) => (
                <div>
                  {index % 8 === 0 ? (
                    <div
                      className='ad-tile'
                      data-mndazid='ead3e00e-3a1a-42f1-b990-c294631f3d97'
                    ></div>
                  ) : (
                    <ContentTile
                      key={content.uid || index}
                      content={content}
                      index={index}
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
        <ContentPreviewPopup
          content={previewContent}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
