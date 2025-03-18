// React & NextJs (Import)
import type { Metadata } from "next";

// Stylesheets
import "@/app/styles/global.scss";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import AuthProvider from "@/hooks/AuthProvider";
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Summarizz",
  description: "TL;DR for your articles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <AuthProvider>
          <Background />
          <NavbarWrapper />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
