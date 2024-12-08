"use client";

import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
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
