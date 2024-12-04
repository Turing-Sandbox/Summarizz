"use client";

import Background from "./components/Background";
import { Footer } from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthProvider from "./hooks/AuthProvider";

export default function Page() {
  return (
    <AuthProvider>
      <Background />
      <Navbar />

      <div className='main-content'>
        <div className='header'>
          <h1>Summarizz</h1>
          <p>Summarize your articles, videos, and more with ease.</p>
        </div>
      </div>
      <Footer/>
    </AuthProvider>
  );
}
