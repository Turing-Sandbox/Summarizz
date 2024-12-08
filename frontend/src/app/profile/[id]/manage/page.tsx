"use client";

import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import ProfileManagement from "../../components/profileManagement";

/**
 * Page() -> JSX.Element
 * 
 * @description
 * Renders the Profile Management page, allowing users to manage their profile.
 * 
 * @returns JSX.Element
 */
export default function Page() {
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
