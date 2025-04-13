"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Local Files (Import)
import { useAuth } from "../hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { User } from "@/models/User";

// Stylesheets
import "@/app/styles/navbar.scss";
import SearchList from "./search/searchList";
import NotificationList from "./notifications/NotificationList";
import { Content } from "@/models/Content";

function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [contentSearchResults, setContentSearchResults] = useState<Content[]>(
    []
  );

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const auth = useAuth();
  const router = useRouter();

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
    setAuthenticated(auth.getUserUID() !== null && auth.getToken() !== null);
    getUserInfo();
    fetchNotifications();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      console.log(userSearchResults);
      console.log(contentSearchResults);

      setShowSearchResults(true);
      setShowMenu(false);
      setShowNotificationList(false);
    } else {
      alert("You didn't search for anything.");
    }
  };

  const updateAuthenticated = () => {
    setAuthenticated(auth.getUserUID() !== null && auth.getToken() !== null);
  };

  function getUserInfo() {
    const userID = auth.getUserUID();
    if (!userID) return;

    axios.get(`${apiURL}/user/${userID}`).then((res) => {
      setUser(res.data);
    });
  }

  const fetchNotifications = async (): Promise<void> => {
    try {
      const response = await axios.get(
        `${apiURL}/notifications/unread/${auth.userUID}`
      );
      const notificationsData = response.data;
      const notificationsArray: Notification[] =
        Object.values(notificationsData);

      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
            router.push("/");
          }}
        >
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>

        {/* Create New Content */}
        {authenticated ? (
          <>
            <form onSubmit={handleSearch} className='searchBarContainer'>
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
              className='navbar-button'
              onClick={() => {
                router.push("/content/create");
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
                className='notification-button'
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
              className='profile-picture-container'
              onClick={() => {
                updateAuthenticated();
                setShowMenu(!showMenu);
                setShowNotificationList(false);
                setShowSearchResults(false);
              }}
            >
              {user && user.profileImage ? (
                <Image
                  src={user.profileImage}
                  width={50}
                  height={50}
                  alt='Profile Picture'
                  className='profile-picture'
                />
              ) : (
                <div className='no-profile-picture-container'>
                  <h1 className='no-profile-picture'>
                    {user?.username[0].toUpperCase()}
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
              onClick={() => router.push("/authentication/login")}
            >
              Login
            </a>
            <a
              className='navbar-link padding-right'
              onClick={() => router.push("/authentication/register")}
            >
              Register
            </a>

            {/* Theme Slider */}
            <label className='theme-toggle-auth'>
              <input
                type='checkbox'
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className='slider-auth'></span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Menu */}
      {showMenu && (
        <div className='menu'>
          {!authenticated ? (
            <>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/authentication/login");
                }}
              >
                Login
              </a>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/authentication/register");
                }}
              >
                Register
              </a>
            </>
          ) : (
            <>
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${auth.getUserUID()}`);
                }}
              >
                View Profile
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${auth.getUserUID()}/manage`);
                }}
              >
                Manage Profile
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/pro/subscribe");
                }}
              >
                Upgrade to Pro
              </a>
              <hr className='menu-divider' />
              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push("/pro/manage");
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
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
