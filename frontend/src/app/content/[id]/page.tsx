"use client";

import Background from "@/app/components/background";
import { Footer } from "@/app/components/footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import { useParams } from "next/navigation";
import ViewContent from "../components/viewContent";

/**
 * Page() -> JSX.Element
 * 
 * @description
 * Renders the Content page by Id, allowing users to view content based on the Id.
 * 
 * @returns JSX.Element
 */
export default function Page() {
  // id for Content
  const { id } = useParams();

  return (
    <>
      <Background />
      <AuthProvider>
        <ViewContent id={id as string} />
        <div className='footer'>
            <Footer/>
        </div>
      </AuthProvider>
    </>
  );
}
