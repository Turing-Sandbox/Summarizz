"use client";

import { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { useAuth } from "../hooks/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    <div className='navbar-background'>
      {/* App Name */}
      <h1 className='navbar-title summarizz-logo'>Summarizz</h1>

      {/* Login/Login */}
      <div className='navbar-menu'>
        {!auth.userUID && !auth.token ? (
          <>
            <a
              className='navbar-menu-item'
              onClick={() => navigate.push("/authentication/login")}
            >
              Login
            </a>
            <a
              className='navbar-menu-item'
              onClick={() => navigate.push("/authentication/register")}
            >
              Register
            </a>
          </>
        ) : (
          <a className='navbar-menu-item' onClick={auth.logout}>
            Logout
          </a>
        )}
      </div>

      {/* Theme Slider */}
      <label className='theme-toggle'>
        <input type='checkbox' checked={isDarkMode} onChange={toggleTheme} />
        <span className='slider'></span>
      </label>
    </div>
  );
}

export default Navbar;
