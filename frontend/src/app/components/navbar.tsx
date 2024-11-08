"use client";

import { useEffect, useState } from "react";
import "../styles/navbar.scss";

function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      <label className='theme-toggle'>
        <input type='checkbox' checked={isDarkMode} onChange={toggleTheme} />
        <span className='slider'></span>
      </label>
    </div>
  );
}

export default Navbar;
