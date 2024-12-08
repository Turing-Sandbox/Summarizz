"use client";

import Register from "@/app/authentication/components/Register";
import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import "../styles/authentication.scss";

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
