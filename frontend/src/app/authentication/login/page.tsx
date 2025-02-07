"use client";

import Login from "@/components/authentication/Login";
import Background from "@/components/Background";
import Footer from "@/components//Footer";
import AuthProvider from "@/hooks/AuthProvider";
import "../styles/authentication.scss";

export default function Page() {
  return (
    <>
      <Background />
      <AuthProvider>
        <Login />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
