"use client";

import { useState } from "react";
import Background from "./components/background";
import Navbar from "./components/navbar";
import Register from "./pages/Authentication/Register";

export default function View() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Background />

      {isAuthenticated && <Navbar />}

      {!isAuthenticated && <Register />}
    </>
  );
}
