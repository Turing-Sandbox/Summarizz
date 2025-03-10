"use client";

import React, { useState, useEffect } from 'react';
import Background from "@/components/Background";
import AuthProvider, { useAuth } from "../hooks/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from 'axios';
import Image from 'next/image';
import { apiURL } from '@/app/scripts/api';
import { HeartIcon, BookmarkIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/outline';
import './styles/content/feed.scss';

interface Content {
  id: string;
  title: string;
  content?: string;
  thumbnail?: string;
  dateCreated: any;
  dateUpdated?: any;
  readtime?: number;
  creatorUID?: string;
  likes?: number;
  views?: number;
  shares?: number;
  bookmarks?: number;
  bookmarkedBy?: string[];
  peopleWhoLiked?: string[];
  sharedBy?: string[];
  titleLower?: string;
  timestamp?: number;
  score?: number; // For personalized content
}

export default function Home() {
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [regularContent, setRegularContent] = useState<Content[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userUID } = useAuth();

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      let trendingFetched = false;
      let regularFetched = false;
      
      // Fetch: trending content (based on views, likes, shares, etc.)
      try {
        console.log('Attempting to fetch trending content from:', `${apiURL}/content/feed/trending`);
        const trendingResponse = await axios.get(`${apiURL}/content/feed/trending`, { timeout: 5000 });
        
        if (trendingResponse.data && trendingResponse.data.success) {
          console.log('Trending content data received successfully');
          setTrendingContent(trendingResponse.data.trendingContent);
          trendingFetched = true;
        } else {
          console.log('No trending content available in response');
          setTrendingContent([]);
        }
      } catch (trendingError) {
        console.log('Error fetching trending content:', trendingError);
        setTrendingContent([]);
      }
      
      // Fetch: regular content (everything other than trending)
      try {
        console.log('Attempting to fetch regular content from:', `${apiURL}/content`);
        const contentResponse = await axios.get(`${apiURL}/content`, { timeout: 5000 });
        
        if (contentResponse.data && contentResponse.data.success) {
          console.log('Regular content data received successfully');
          setRegularContent(contentResponse.data.content);
          regularFetched = true;
          
          // Generate personalized content client-side if user is logged in
          if (userUID && contentResponse.data.content && contentResponse.data.content.length > 0) {
            console.log('Generating personalized content client-side');
            
            // Get user data from local storage if available
            const likedContentIds = JSON.parse(localStorage.getItem('likedContent') || '[]');
            const followedCreators = JSON.parse(localStorage.getItem('followedCreators') || '[]');
            
            // Score content based on user preferences
            const scoredContent = contentResponse.data.content.map((content: Content) => {
              let score = 0;
              
              // Boost score if content is from someone the user follows
              if (followedCreators.includes(content.creatorUID)) {
                score += 10; // High priority for followed creators
              }
              
              // Add popularity factors
              score += (content.likes || 0) * 0.2;
              score += (content.views || 0) * 0.1;
              
              // Add recency factor
              if (content.dateCreated) {
                const now = new Date();
                const contentDate = content.dateCreated instanceof Date 
                  ? content.dateCreated 
                  : new Date(content.dateCreated);
                
                // Calculate days difference
                const daysDiff = Math.floor((now.getTime() - contentDate.getTime()) / (1000 * 3600 * 24));
                
                // Boost newer content (within last 7 days)
                if (daysDiff < 7) {
                  score += (7 - daysDiff) * 0.5;
                }
              }
              
              return {
                ...content,
                score: score // Explicitly assign score to avoid TypeScript errors
              };
            });
            
            // Sort by score and get top results
            const personalizedContent = scoredContent
              .sort((a: Content, b: Content) => (b.score || 0) - (a.score || 0))
              .slice(0, 8);
            
            setPersonalizedContent(personalizedContent);
          }
        } else {
          console.log('No regular content available in response');
          setRegularContent([]);
        }
      } catch (contentError) {
        console.log('Error fetching regular content:', contentError);
        setRegularContent([]);
      }
    
      // If both the regular content and trending content failed to fetch, set error
      if (!trendingFetched && !regularFetched) {
        setError('Failed to fetch content. Please ensure the backend server is running.');
      }
      
      setIsLoading(false);
    };
    
    fetchContent();
  }, [userUID]);

  const handleContentClick = (contentId: string) => {
    window.location.href = `/content/${contentId}`;
  };

  function renderContentItem(content: Content) {    
    const safeContent = {
      ...content,
      title: typeof content.title === 'string' ? content.title : String(content.title || ''),
      likes: typeof content.likes === 'number' ? content.likes : 0,
      views: typeof content.views === 'number' ? content.views : 0,
      shares: typeof content.shares === 'number' ? content.shares : 0,
      readtime: typeof content.readtime === 'number' ? content.readtime : 1,
      bookmarkedBy: Array.isArray(content.bookmarkedBy) ? content.bookmarkedBy : [],
      bookmarks: Array.isArray(content.bookmarkedBy) ? content.bookmarkedBy.length : 0
    };
    
    return (
      <div 
        key={safeContent.id} 
        className='content-list-item' 
        onClick={() => handleContentClick(safeContent.id)}
      >
        <h3 className='content-item-title'>{safeContent.title}</h3>
        
        {/* Date/Read Time */}
        <p className="content-meta">
          {formatDate(safeContent.dateCreated, safeContent.readtime)}
        </p>
        
        {/* Engagement Stats */}
        <div className="content-stats">
          <span className="stat-item">
            <HeartIcon className="stat-icon" />
            {safeContent.likes || 0}
          </span>
          <span className="stat-item">
            <EyeIcon className="stat-icon" />
            {safeContent.views || 0}
          </span>
          <span className="stat-item">
            <ShareIcon className="stat-icon" />
            {safeContent.shares || 0}
          </span>
          <span className="stat-item">
            <BookmarkIcon className="stat-icon" />
            {safeContent.bookmarks || 0}
          </span>
        </div>
        
        {/* Thumbnail */}
        {safeContent.thumbnail && (
          <div className='content-thumbnail-container'>
            <Image
              src={safeContent.thumbnail}
              alt='Thumbnail'
              width={500}
              height={500}
              className='content-thumbnail'
            />
          </div>
        )}
      </div>
    );
  }

  function formatDate(date: Date | string | { seconds: number } | null | undefined, readtime?: number): string {
    if (!date) return 'Recent';
    
    try {
      let d: Date;
      
      if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string') {
        d = new Date(date);
      } else if (typeof date === 'object' && 'seconds' in date) {
        d = new Date(date.seconds * 1000);
      } else {
        return 'Recent';
      }
      
      if (isNaN(d.getTime())) {
        return 'Recent';
      }
      
      // Format: "MM DD, YYYY · N min read"
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const formattedDate = d.toLocaleDateString('en-US', options);
      
      const readingTimeValue = typeof readtime === 'number' ? readtime : 1;
      return `${formattedDate} · ${readingTimeValue} min read`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recent';
    }
  }

  return (
    <AuthProvider>
      <Background />
      <Navbar />
      
      <main className="main-content">
        {isLoading ? (
          <div className="loading-container">
            <p>Loading content...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Trending Content Section */}
            <section className="trending-content">
              <div className="trending-header">
                <h2>Trending</h2>
              </div>
              <div className="trending-content-list">
                {trendingContent.length > 0 ? (
                  trendingContent.map(content => (
                    <div key={content.id} className="content-card">
                      {renderContentItem(content)}
                    </div>
                  ))
                ) : (
                  <p>Sorry, there is currently no trending content.</p>
                )}
              </div>
            </section>
            
            {/* Personalized Content Section - Only show if user is logged in */}
            {userUID && (
              <section className="personalized-content">
                <div className="personalized-header">
                  <h2>For You</h2>
                  <button 
                    className="refresh-button"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </button>
                </div>
                <div className="content-grid">
                  {personalizedContent.length > 0 ? (
                    personalizedContent.map(content => (
                      <div key={content.id} className="content-card">
                        {renderContentItem(content)}
                      </div>
                    ))
                  ) : (
                    <p>Loading your personalized recommendations...</p>
                  )}
                </div>
              </section>
            )}
            
            {/* Regular Content Section */}
            <section className="content">
              <div className="content-header">
                <h2>Your Content Feed</h2>
                <button 
                  className="refresh-button"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
              <div className="content-grid">
                {regularContent.length > 0 ? (
                  regularContent.map(content => (
                    <div key={content.id} className="content-card">
                      {renderContentItem(content)}
                    </div>
                  ))
                ) : (
                  <p>Sorry, there is currently no content available.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </AuthProvider>
  );
}