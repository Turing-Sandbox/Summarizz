"use client";

import { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { useAuth } from "../hooks/AuthProvider";
import { useRouter } from "next/navigation";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const auth = useAuth();
  const navigate = useRouter();

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setIsDarkMode(currentTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <div className='navbar-background'>
        {/* App Name */}
        <a href='/'>
          <h1 className='navbar-title summarizz-logo'>Summarizz</h1>
        </a>

        {/* Create New Content */}
        <button
          className='navbar-button'
          onClick={() => navigate.push("/content/create")}
        >
          Create Content
        </button>

        {/* Profile Picture */}
        <div className='profile-picture' onClick={() => setShowMenu(!showMenu)}>
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
          {auth.getUserUID() === null && auth.getToken() === null ? (
            <>
              <a
                className='menu-item'
                onClick={() => navigate.push("/authentication/login")}
              >
                Login
              </a>
              <a
                className='menu-item'
                onClick={() => navigate.push("/authentication/register")}
              >
                Register
              </a>
            </>
          ) : (
            <a className='menu-item' onClick={auth.logout}>
              Logout
            </a>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
