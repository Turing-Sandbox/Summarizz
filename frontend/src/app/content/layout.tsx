"use client";

import { ReactNode } from "react";
import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "@/app/styles/global.scss";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Background />
      <Navbar />

      <div>{children}</div>

      <div className='footer'>
        <Footer />
      </div>
    </>
  );
}
