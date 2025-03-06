// React & NextJs (Import)
import type { Metadata } from "next";
import AuthProvider from "@/hooks/AuthProvider";

// Stylesheets
import "@/app/styles/global.scss";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
