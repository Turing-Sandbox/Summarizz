"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import AuthProvider from "@/app/hooks/AuthProvider";
import EditContent from "../../components/editContent";

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
