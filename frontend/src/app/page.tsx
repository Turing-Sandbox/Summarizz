"use client";

import Background from "@/components/Background";
import AuthProvider from "../hooks/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <div className='main-content'>
      <div className='header'>
        <h1>Summarizz</h1>
        <p>Summarize your articles, videos, and more with ease.</p>
      </div>
    </div>
  );
}
