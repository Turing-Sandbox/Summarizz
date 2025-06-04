import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchUser, SearchContent } from "../../models/SearchResult";
import { SearchService } from "../../services/SearchService";
import UserSearchResult from "../../components/search/UserSearchResult";
import ContentSearchResult from "../../components/search/ContentSearchResult";
import "../../styles/search/search.scss";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [content, setContent] = useState<SearchContent[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Use refs to track if initial fetch has been done and prevent duplicate calls
  const initialFetchDone = useRef(false);
  const fetchInProgress = useRef(false);
  const currentQuery = useRef("");

  const USER_LIMIT = 10;
  const CONTENT_LIMIT = 20;
  const TOTAL_LIMIT = USER_LIMIT + CONTENT_LIMIT;

  const fetchResults = useCallback(async () => {
    // Prevent duplicate calls and check valid query
    if (!query || 
        query.length < 3 || 
        loading || 
        !hasMore || 
        fetchInProgress.current) {
      return;
    }
    
    fetchInProgress.current = true;
    setLoading(true);
    
    try {
      console.log(`Fetching results for "${query}" with offset ${offset}`);
      const response = await SearchService.search(query, "all", TOTAL_LIMIT, offset);
      
      if (response instanceof Error) {
        console.error("Error fetching search results:", response);
      } else {
        const newUsers: SearchUser[] = response.users || [];
        const newContent: SearchContent[] = response.content || [];
        
        // Check if we've reached the end of results
        if ((newUsers.length + newContent.length) < TOTAL_LIMIT) {
          setHasMore(false);
        }

        setUsers(prev => [...prev, ...newUsers]);
        setContent(prev => [...prev, ...newContent]);
        setOffset(prev => prev + newUsers.length + newContent.length);
      }
    } catch (error) {
      console.error("Error in fetchResults:", error);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [query, loading, hasMore, offset, TOTAL_LIMIT]);

  // Reset state when query changes
  useEffect(() => {
    if (currentQuery.current !== query) {
      currentQuery.current = query;
      setUsers([]);
      setContent([]);
      setOffset(0);
      setHasMore(true);
      initialFetchDone.current = false;
    }
  }, [query]);

  // Initial data fetch - only run once per query!!
  useEffect(() => {
    if (!initialFetchDone.current && query && query.length >= 3) {
      initialFetchDone.current = true;
      fetchResults().catch(error => {
        console.error("Failed to fetch initial results:", error);
      });
    }
  }, [query, fetchResults]);

  return (
    <div className="page-container">
      <div className="search-results-page">
        <h1 className="search-results-title">Search Results for: {query}</h1>
        
        <div className="search-results-container">
          <div className="search-section">
            <h2 className="search-section-title">Users</h2>
            <div className="search-results-list">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <div key={`user-${user.user_id || index}`} className="search-item">
                    <UserSearchResult user={user} />
                  </div>
                ))
              ) : (
                <p className="no-results">No users found matching "{query}"</p>
              )}
            </div>
          </div>
          
          <div className="search-section">
            <h2 className="search-section-title">Content</h2>
            <div className="search-results-list">
              {content.length > 0 ? (
                content.map((item, index) => (
                  <div key={`content-${item.content_id || index}`} className="search-item">
                    <ContentSearchResult content={item} />
                  </div>
                ))
              ) : (
                <p className="no-results">No content found matching "{query}"</p>
              )}
            </div>
          </div>
        </div>
        
        {hasMore && (
          <button 
            className="load-more-button" 
            onClick={() => fetchResults().catch(error => {
              console.error("Failed to load more results:", error);
            })}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Results"}
          </button>
        )}
      </div>
    </div>
  );
}
