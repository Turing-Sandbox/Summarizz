"use client";

import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import { useParams } from "next/navigation";
import ViewProfile from "../components/viewProfile";

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
