"use client";

import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import EditContent from "../../components/editContent";

/**
 * Page() -> JSX.Element
 * 
 * @description
 * Renders the Edit content page, allowing users to edit their previously
 * created content.
 * 
 * @returns JSX.Element
 */
export default function Page() {
  return (
    <>
      <Background />
      <AuthProvider>
        <EditContent />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
