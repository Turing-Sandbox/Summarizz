"use client";

import Login from "@/app/authentication/components/Login";
import Background from "@/app/components/background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";

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
