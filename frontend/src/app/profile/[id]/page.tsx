"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import { useParams } from "next/navigation";
import ViewProfile from "../components/viewProfile";

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
