"use client";

import { useAuth } from "@/hooks/AuthProvider";
import { Content } from "@/models/Content";
import { useEffect, useState } from "react";
import { apiURL } from "./scripts/api";
import axios from "axios";
import { HeartIcon } from "@heroicons/react/24/outline";
import ContentTile from "@/components/content/ContentTile";
import { User } from "@/models/User";

export default function Page() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [latestContent, setLatestContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
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
        setTrendingContent(trendingResponse.data.trendingContent);
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
        setLatestContent(contentResponse.data.content);
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
    try {
      const personalizedResponse = await axios.get(
        `${apiURL}/content/feed/personalized`,
        { timeout: 5000 }
      );

      if (personalizedResponse.data && personalizedResponse.data.success) {
        setPersonalizedContent(personalizedResponse.data.personalizedContent);
        return true;
      } else {
        setPersonalizedContent([]);
      }
    } catch (personalizedError) {
      setPersonalizedContent([]);
    }
    return false;
  }

  return (
    <div className='main-content'>
      {isLoading && <p>Loading...</p>}

      {user && <h1>Welcome, {user?.firstName}</h1>}
      <h2>Top Trending</h2>
      <div className='content-list'>
        {trendingContent.map((content, index) => (
          <ContentTile key={content.id} content={content} index={index} />
        ))}
      </div>
      {errorTrending && <p className='error'>{errorTrending}</p>}

      <h2>Latest Post</h2>
      <div className='content-list'>
        {latestContent.map((content, index) => (
          <ContentTile key={content.id} content={content} index={index} />
        ))}
      </div>
      {errorLatest && <p className='error'>{errorLatest}</p>}

      <h2>For You</h2>
      <div className='content-list'>
        {personalizedContent.map((content, index) => (
          <ContentTile key={content.id} content={content} index={index} />
        ))}
      </div>
      {errorPersonalized && <p className='error'>{errorPersonalized}</p>}
    </div>
  );
}
