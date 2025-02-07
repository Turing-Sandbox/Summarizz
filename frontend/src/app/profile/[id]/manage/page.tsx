"use client";


import AuthProvider from "@/hooks/AuthProvider";
import ProfileManagement from "../../../../components/profile/ProfileManagement";
import Background from "@/components/Background";
import Footer from "@/components/Footer";

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
