"use client";


import AuthProvider from "@/hooks/AuthProvider";
import EditContent from "../../../../components/content/editContent";
import Background from "@/components/Background";
import Footer from "@/components/Footer";

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
