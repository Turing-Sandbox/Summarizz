// React & NextJs (Import)
import type { Metadata } from "next";

// Stylesheets
import "@/app/styles/global.scss";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import AuthProvider from "@/hooks/AuthProvider";
import NavbarWrapper from "@/components/NavbarWrapper";
import Head from "next/head";
import Script from "next/script";

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
      <Head>
        {/* Mondiad */}
        <meta name='mnd-ver' content='tqpk2mhrbw7rn7kvycrga' />
      </Head>
      <body>
        {/* Mondiad Script */}
        <Script src='https://ss.mrmnd.com/native.js' strategy='lazyOnload' />
        {/* AdSense Script (if needed) */}
        {/* <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5798408924792660"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        /> */}
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
