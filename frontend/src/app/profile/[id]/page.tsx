"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import Profile from "../components/profile";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Background />
      <AuthProvider>
        <Profile id={id as string} />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
