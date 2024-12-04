"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import CreateContent from "../components/createContent";

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
