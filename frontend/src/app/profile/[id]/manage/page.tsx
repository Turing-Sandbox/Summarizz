"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import { useParams } from "next/navigation";
import ProfileManagement from "../../components/ProfileManagement";

export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Background />
      <AuthProvider>
        <ProfileManagement />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
