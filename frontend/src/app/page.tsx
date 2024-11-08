"use client";

import Background from "./components/background";
import Navbar from "./components/navbar";
import Register from "./pages/Authentication/Register";
import AuthProvider, { useAuth } from "./hooks/AuthProvider";

export default function View() {
  const auth = useAuth();

  return (
    <>
      <Background />
      <AuthProvider>
        {auth.user && <Navbar />}

        {!auth.user && <Register />}
      </AuthProvider>
    </>
  );
}
