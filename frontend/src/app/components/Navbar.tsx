"use client";

import { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { useAuth } from "../hooks/AuthProvider";
import { useRouter } from "next/navigation";

function Navbar() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

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

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", isDarkMode ? "false" : "true");
  };

  const updateAuthenticated = () => {
    setAuthenticated(auth.getUserUID() !== null && auth.getToken() !== null);
  };

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
        <button
          className='navbar-button'
          onClick={() => router.push("/content/create")}
        >
          Create Content
        </button>

        {/* Profile Picture */}
        <div
          className='profile-picture'
          onClick={() => {
            updateAuthenticated();
            setShowMenu(!showMenu);
          }}
        >
          {/* <img
                src={
                auth.user?.profilePicture ||
                "https://www.gravatar.com/avatar/
                ?d=identicon"
                }
                alt='Profile Picture'
            /> */}
        </div>

        {/* Theme Slider */}
        <label className='theme-toggle'>
          <input type='checkbox' checked={isDarkMode} onChange={toggleTheme} />
          <span className='slider'></span>
        </label>
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
                Profile
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
