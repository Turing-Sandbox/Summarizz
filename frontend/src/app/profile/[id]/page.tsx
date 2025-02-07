"use client";

import { useParams } from "next/navigation";
import ViewProfile from "../../../components/profile/viewProfile";
import AuthProvider from "@/hooks/AuthProvider";
import Background from "@/components/Background";
import Footer from "@/components/Footer";

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
