import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchUser, SearchContent } from '../../models/SearchResult';
import { SearchService } from '../../services/SearchService';
import UserSearchResult from './UserSearchResult';
import ContentSearchResult from './ContentSearchResult';
import '../../styles/search/search.scss';

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [contentResults, setContentResults] = useState<SearchContent[]>([]);
  const [loading, setLoading] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const fetchInProgress = useRef(false);
  const initialRender = useRef(true);
  const previousPath = useRef(location.pathname);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Immediately hide dropdown when location changes
  // This runs before any other effects
  useEffect(() => {
    // Hide dropdown immediately on any location change
    setShowResults(false);
    
    // If the path has changed (not including search params)
    if (location.pathname !== previousPath.current) {
      // Clear the search input and results
      setQuery('');
      setDebouncedQuery('');
      setUserResults([]);
      setContentResults([]);
      
      // Clear any pending debounce timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      
      // Update the previous path
      previousPath.current = location.pathname;
    }
  }, [location]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce the search query with a 500ms delay
  useEffect(() => {
    // Skip if this is the initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Don't set up a new timer if we're on the search results page
    if (location.pathname === '/search') {
      return;
    }

    debounceTimer.current = setTimeout(() => {
      if (query.trim().length >= 3) {
        setDebouncedQuery(query);
      } else {
        setShowResults(false);
      }
      debounceTimer.current = null;
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [query, location.pathname]);

  // Fetch search results when debounced query changes
  useEffect(() => {
    // Don't fetch results if we're already on the search results page
    if (location.pathname === '/search') {
      return;
    }
    
    // Don't fetch on initial render
    if (initialRender.current) {
      return;
    }
    
    if (debouncedQuery.trim().length >= 3) {
      fetchSearchResults();
    }
  }, [debouncedQuery, location.pathname]);

  // Fetch search results from the API
  const fetchSearchResults = async () => {
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setLoading(true);
    
    try {
      console.log(`SearchBar: Fetching dropdown results for "${debouncedQuery}"`);
      const response = await SearchService.search(debouncedQuery, "all", 5, 0);
      
      // Check if the path has changed since we started the fetch
      if (location.pathname !== previousPath.current) {
        // Don't update state if we've navigated away
        return;
      }
      
      if (!(response instanceof Error)) {
        // Explicitly type the response to ensure type safety
        const users: SearchUser[] = response.users;
        const content: SearchContent[] = response.content;
        
        setUserResults(users);
        setContentResults(content);
        setShowResults(true);
      } else {
        console.error('Search error:', response);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (query.trim().length >= 3) {
      setShowResults(false);
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Only show results if there's a valid query
    if (query.trim().length >= 3 && userResults.length + contentResults.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search..."
          aria-label="Search"
        />
        <button type="submit" className="search-button" aria-label="Submit search">
          <MagnifyingGlassIcon className="search-icon" />
        </button>
      </form>

      {showResults && query.trim().length >= 3 && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-loading">Loading...</div>
          ) : (
            <>
              <div className="search-section">
                <h3 className="search-section-title">Users</h3>
                {userResults.length > 0 ? (
                  userResults.map((user, index) => (
                    <div key={`user-${user.user_id || index}`} className="search-dropdown-item" onClick={() => setShowResults(false)}>
                      <UserSearchResult user={user} />
                    </div>
                  ))
                ) : (
                  <p className="no-results">No users found</p>
                )}
              </div>

              <div className="search-section">
                <h3 className="search-section-title">Content</h3>
                {contentResults.length > 0 ? (
                  contentResults.map((item, index) => (
                    <div key={`content-${item.content_id || index}`} className="search-dropdown-item" onClick={() => setShowResults(false)}>
                      <ContentSearchResult content={item} />
                    </div>
                  ))
                ) : (
                  <p className="no-results">No content found</p>
                )}
              </div>

              <div className="search-view-all">
                <button onClick={handleSearch} className="view-all-button">
                  View all results
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
