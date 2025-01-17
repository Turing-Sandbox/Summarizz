"use client";

import { useParams } from "next/navigation";
import ViewProfile from "../components/viewProfile";
import Background from "@/app/components/Background";
import AuthProvider from "@/app/hooks/AuthProvider";
import Footer from "@/app/components/Footer";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Profile page by Id, allowing users to view their profile.
 *
 * @returns JSX.Element
 */
export default function Page() {
  const { id } = useParams();

  return (
    <>
      <Background />
      <AuthProvider>
        <ViewProfile id={id as string} />

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
