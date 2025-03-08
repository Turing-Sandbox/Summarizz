"use client";

import AuthProvider from "@/hooks/AuthProvider";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import SearchList from "@/components/search/searchList";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        <div className='main-content'>
          <SearchList />
        </div>
        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
