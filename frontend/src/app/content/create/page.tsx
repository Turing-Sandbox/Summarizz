"use client";

import Background from "@/app/components/Background";
import Footer from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import CreateContent from "../components/createContent";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Create Content page, allowing users to create content.
 *
 * @returns JSX.Element
 */
export default function Page() {
  return (
    <>
      <Background />
      <AuthProvider>
        <CreateContent />
        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
