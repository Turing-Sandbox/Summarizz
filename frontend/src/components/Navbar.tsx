import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { User } from "../models/User";
import { Content } from "../models/Content";
import { Notification } from "../models/Notification";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL } from "../scripts/api";
import SearchList from "./search/SearchList";

import Cookies from "js-cookie";
import NotificationList from "./notification/NotificationList";

export default function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [contentSearchResults, setContentSearchResults] = useState<Content[]>(
    []
  );

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProUser, setIsProUser] = useState<boolean>(false);

  const auth = useAuth();
  const navigate = useNavigate();

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Dark Mode handling
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const preferenceMode = localStorage.getItem("isDarkMode");

    // Check if user has a saved preference in cookies
    if (preferenceMode) {
      if (preferenceMode === "true") {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }
    }

    // If notCheck system preference as default.
    if (!preferenceMode) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");

      if (mq.matches) {
        setIsDarkMode(true);
      }

      // This callback will fire if the perferred color scheme changes without a reload
      mq.addEventListener("change", (evt) => setIsDarkMode(evt.matches));
    }
  }, []);

  // Update user info
  useEffect(() => {
    if (auth.isAuthenticated !== undefined) {
      // Only call these functions when the auth state is initialized
      fetchNotifications();
      checkSubscriptionStatus();
    }
  }, [auth.isAuthenticated]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const toggleTheme = () => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode ? "false" : "true");
  };

  const toggleNotificationList = () => {
    setShowNotificationList(!showNotificationList);
    setShowSearchResults(false);
    setShowMenu(false);
  };

  /**
   * handleSearch() -> void
   *
   * @description
   * Uses the Next.js router to push the user to the search results page,
   * with the user's input as a url query parameter.
   */
  const handleSearch = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (query) {
      // Redirect to the search results page, where the actual searching happens.
      // router.push(`/search?query=${encodeURIComponent(query)}`);
      // window.location.href = `/search?query=${encodeURIComponent(query)}`;

      const userSearchResults = await axios.get(`${apiURL}/search/users/`, {
        params: {
          searchText: query,
        },
      });

      const contentSearchResults = await axios.get(
        `${apiURL}/search/content/`,
        {
          params: {
            searchText: query,
          },
        }
      );

      setUserSearchResults(userSearchResults.data.documents);
      setContentSearchResults(contentSearchResults.data.documents);
      setShowSearchResults(true);
      setShowMenu(false);
      setShowNotificationList(false);
    } else {
      alert("You didn't search for anything.");
    }
  };

  const fetchNotifications = async (): Promise<void> => {
    // Only fetch notifications if user is authenticated and has a UID
    if (!auth.isAuthenticated || !auth.user?.uid) {
      return;
    }

    try {
      const response = await axios.get(
        `${apiURL}/notification/unread/${auth.user.uid}`,
        { withCredentials: true }
      );

      const notificationsData = response.data;
      // Check if the response is a string (error message) or an object (notifications)
      if (typeof notificationsData === "string") {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const notificationsArray: Notification[] =
        Object.values(notificationsData);

      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set empty notifications on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const checkSubscriptionStatus = async (): Promise<void> => {
    if (!auth.isAuthenticated) return;

    try {
      const response = await axios.get(`${apiURL}/subscription/status`, {
        withCredentials: true,
      });

      // Check if user has an active subscription
      const subscriptionData = response.data;
      setIsProUser(
        subscriptionData &&
          subscriptionData.status === "active" &&
          !subscriptionData.canceledAt
      );
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setIsProUser(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("title");
    }
    auth.logout();
  };

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      {(showSearchResults || showMenu || showNotificationList) && (
        <div
          className='navbar-page-overlay'
          onClick={() => {
            setShowSearchResults(false);
            setShowMenu(false);
            setShowNotificationList(false);
          }}
        ></div>
      )}
      <div className='navbar-background'>
        {/* App Name */}
        <a
          onClick={() => {
            setShowMenu(false);
            navigate("/");
          }}
        >
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>

        {/* Create New Content */}
        {auth.isAuthenticated ? (
          <>
            <form
              onSubmit={handleSearch}
              className='searchBarContainer search-large-screen'
            >
              <input
                type='text'
                className='searchBar'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search for something!'
              />
              <button className='searchButton'>
                <MagnifyingGlassIcon />
              </button>
              {showSearchResults && (
                <div className='nav-searchResults'>
                  <SearchList
                    userSearchResults={userSearchResults}
                    contentSearchResults={contentSearchResults}
                  />
                </div>
              )}
            </form>

            <button
              className='navbar-button navbar-button-large-screen'
              onClick={() => {
                navigate("/content/create");
                localStorage.removeItem("title");
                Cookies.remove("content");
              }}
            >
              Create Content
            </button>

            {/* Notifications */}
            <div>
              <div
                onClick={toggleNotificationList}
                className='notification-button notification-button-large-screen'
              >
                <BellIcon className='icon' />
                {unreadCount > 0 && <span>{unreadCount}</span>}
              </div>

              {showNotificationList && (
                <div className='notification-list-container'>
                  <NotificationList
                    notifications={notifications}
                    unreadCount={unreadCount}
                    setUnreadCount={setUnreadCount}
                  />
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div
              className='profile-picture-container profile-picture-container-large-screen'
              onClick={() => {
                setShowMenu(!showMenu);
                setShowNotificationList(false);
                setShowSearchResults(false);
              }}
            >
              {auth.user && auth.user.profileImage ? (
                <img
                  src={auth.user.profileImage}
                  width={50}
                  height={50}
                  alt='Profile Picture'
                  className='profile-picture'
                />
              ) : (
                <div className='no-profile-picture-container'>
                  <h1 className='no-profile-picture'>
                    {auth.user?.username[0].toUpperCase() || ""}
                  </h1>
                </div>
              )}
            </div>

            {/* Theme Slider */}
            <label className='theme-toggle'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider'></span>
            </label>
          </>
        ) : (
          <div className='navbar-auth'>
            <a
              className='navbar-link'
              onClick={() => navigate("/authentication/login")}
            >
              Login
            </a>
            <a
              className='navbar-link padding-right'
              onClick={() => navigate("/authentication/register")}
            >
              Register
            </a>

            {/* Theme Slider */}
            <label className='theme-toggle slider-auth'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider slider-auth'></span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Menu */}
      {showMenu && (
        <div className='menu'>
          <>
            {/* MOBILE DISPLAY */}
            <div className='menu-header'>
              {/* Close Menu */}
              <div
                className='close-menu'
                onClick={() => {
                  setShowMenu(false);
                  setShowNotificationList(false);
                  setShowSearchResults(false);
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='icon icon-tabler icon-tabler-x'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                  <path d='M18 6l-12 12' />
                  <path d='M6 6l12 12' />
                </svg>
              </div>
            </div>

            {/* ALWAYS DISPLAYED */}
            <a
              className='menu-item'
              onClick={() => {
                setShowMenu(false);
                navigate(`/profile/${auth.user?.uid}`);
              }}
            >
              View Profile
            </a>
            <hr className='menu-divider' />
            <a
              className='menu-item'
              onClick={() => {
                setShowMenu(false);
                navigate(`/profile/manage`);
              }}
            >
              Manage Profile
            </a>
            <hr className='menu-divider' />
            {!isProUser && (
              <>
                <a
                  className='menu-item upgrade-pro-item'
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/pro");
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='pro-star-icon'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Upgrade to Pro
                </a>
                <hr className='menu-divider' />
              </>
            )}
            <a
              className='menu-item'
              onClick={() => {
                setShowMenu(false);
                navigate("/pro/manage");
              }}
            >
              Manage Subscription
            </a>
            <hr className='menu-divider' />
            <a
              className='menu-item'
              onClick={() => {
                setShowMenu(false);
                handleLogout();
              }}
            >
              Logout
            </a>
          </>

          {/* Create Content */}
          <button
            className='navbar-button navrbar-button-mobile'
            onClick={() => {
              navigate("/content/create");
              localStorage.removeItem("title");
              Cookies.remove("content");
            }}
          >
            Create Content
          </button>
        </div>
      )}
    </>
  );
}
