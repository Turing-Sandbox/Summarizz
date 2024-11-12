"use client";

import Background from "./components/Background";
import { Footer } from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthProvider from "./hooks/AuthProvider";

export default function View() {
  // const auth = useAuth();

  return (
    <>
      <Background />
      <AuthProvider>
        <Navbar />

        <div className='main-content'>
          <div className='header'>
            <h1>Summarizz</h1>
            <p>Summarize your text with ease</p>
          </div>
        </div>

        <div className='footer'>
          <Footer />
        </div>
      </AuthProvider>
    </>
  );
}
