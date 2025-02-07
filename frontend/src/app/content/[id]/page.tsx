"use client";


import AuthProvider from "@/hooks/AuthProvider";
import { useParams } from "next/navigation";
import ViewContent from "../../../components/content/viewContent";
import Background from "@/components/Background";
import Footer from "@/components/Footer";

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
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
