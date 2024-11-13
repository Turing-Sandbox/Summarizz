"use client";

import Background from "@/app/components/Background";
import { Footer } from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import AuthProvider, { useAuth } from "@/app/hooks/AuthProvider";
import "../styles/content.scss";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const auth = useAuth();
  const router = useRouter();

  if (auth.getUserUID() === null && auth.getToken() === null) {
    router.push("/authentication/login");
  }

  return (
    <>
      <Background />
      <Navbar />

      <AuthProvider>
        <div className='main-content'>
          <h1>Create Content</h1>

          <form>
            <input
              className='content-input'
              type='text'
              id='title'
              name='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Title'
            />

            <textarea
              className='content-input'
              id='content'
              name='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Content'
            />

            <label htmlFor='file-upload' className='content-file-upload'>
              Upload Thumbnail
            </label>
            <input id='file-upload' type='file' />

            <button className='content-button' type='submit'>
              Published
            </button>
          </form>
        </div>
      </AuthProvider>

      <div className='footer'>
        <Footer />
      </div>
    </>
  );
}
