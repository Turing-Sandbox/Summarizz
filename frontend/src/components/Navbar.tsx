"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Local Files (Import)
import { useAuth } from "../hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { User } from "@/models/User";

// Stylesheets
import "@/app/styles/navbar.scss";

function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [query, setQuery] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>();

  const auth = useAuth();
  const router = useRouter();

  // ---------------------------------------
  // ------------ Event Handler ------------
  // ---------------------------------------

  // Dark Mode handling
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode ? "false" : "true");
  };


  /**
   * handleSearch() -> void
   *
   * @description
   * Uses the Next.js router to push the user to the search results page,
   * with the user's input as a url query parameter.
   */
  const handleSearch = () => {
    if (query) {
      // Redirect to the search results page, where the actual searching happens.
      router.push(`/search?query=${encodeURIComponent(query)}`);
    } else {
      alert("You didn't search for anything.")
    }
  }

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

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
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
            <form onSubmit={handleSearch} className="searchBarContainer">
              <input type="text" className="searchBar" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for something!" required />
              <button className="searchButton"><MagnifyingGlassIcon /></button>
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

            {/* Profile Picture */}
            <div
              className='profile-picture-container'
              onClick={() => {
                updateAuthenticated();
                setShowMenu(!showMenu);
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

              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${auth.getUserUID()}/manage`);
                }}
              >
                Manage Profile
              </a>

              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  auth.logout();
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
