"use client";


import AuthProvider from "@/hooks/AuthProvider";
import "@/app/styles/authentication/authentication.scss";
import Background from "@/components/Background";
import Register from "@/components/authentication/Register";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Background />
      <AuthProvider>
        <Register />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
