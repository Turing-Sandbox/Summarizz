"use client";

import { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { useAuth } from "../hooks/AuthProvider";
import { useRouter } from "next/navigation";
import { User } from "../profile/models/User";
import Image from "next/image";
import axios from "axios";
import { apiURL } from "../scripts/api";
import Cookies from "js-cookie";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const { user, userUID, getToken, logout } = useAuth();
  const router = useRouter();

  const authenticated = user !== null && getToken() !== null;

  useEffect(() => {
    const preferenceMode = localStorage.getItem("isDarkMode");

    if (preferenceMode) {
      if (preferenceMode === "true") {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }
    } else {
      // Check system preference if no local setting
      const mq = window.matchMedia("(prefers-color-scheme: dark)");

      if (mq.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      }

      mq.addEventListener("change", (evt) => {
        setIsDarkMode(evt.matches);
        document.documentElement.setAttribute(
          "data-theme",
          evt.matches ? "dark" : "light"
        );
      });
    }
  }, []);

  useEffect(() => {
    // Fetch user info if logged in
    if (userUID) {
      axios.get(`${apiURL}/user/${userUID}`).then((res) => {
        setUserInfo(res.data);
      });
    } else {
      setUserInfo(null);
    }
  }, [userUID]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", (!isDarkMode).toString());
  };

  return (
    <>
      <div className='navbar-background'>
        <a
          onClick={() => {
            setShowMenu(false);
            router.push("/");
          }}
        >
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>

        {authenticated ? (
          <>
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

            <div
              className='profile-picture-container'
              onClick={() => {
                setShowMenu((prev) => !prev);
              }}
            >
              {userInfo && userInfo.profileImage ? (
                <Image
                  src={userInfo.profileImage}
                  width={50}
                  height={50}
                  alt='Profile Picture'
                  className='profile-picture'
                />
              ) : (
                <div className='no-profile-picture-container'>
                  <h1 className='no-profile-picture'>
                    {userInfo?.username?.[0].toUpperCase() || "U"}
                  </h1>
                </div>
              )}
            </div>

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
                  router.push(`/profile/${userUID}`);
                }}
              >
                View Profile
              </a>

              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/profile/${userUID}/manage`);
                }}
              >
                Manage Profile
              </a>

              <a
                className='menu-item'
                onClick={() => {
                  setShowMenu(false);
                  logout();
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
