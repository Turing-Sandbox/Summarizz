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
      <head>
        <script
          async
          src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5798408924792660'
          crossOrigin='anonymous'
        ></script>
      </head>
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
