"use client";


import AuthProvider from "@/hooks/AuthProvider";
import CreateContent from "../../../components/content/createContent";
import Background from "@/components/Background";

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
        <CreateContent />
      </AuthProvider>
    </>
  );
}
