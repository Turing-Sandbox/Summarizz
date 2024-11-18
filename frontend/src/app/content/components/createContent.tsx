"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import "../styles/content.scss";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { apiURL } from "@/app/scripts/api";

export default function CreateContent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [error, setError] = useState("");
  // const [authenticated, setAuthenticated] = useState(false);

  const auth = useAuth();
  const router = useRouter();

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
      setError("Please select a valid image file.");
    }
  };

  // console.log("auth.getUserUID: ", auth.getUserUID());
  // console.log("auth.getToken: ", auth.getToken());

  function handleSubmit() {
    // Reset Error Message
    setError("");

    // Validate user input
    if (title === "" || content === "") {
      setError("Title and content are required.");
      return;
    }

    if (thumbnail) {
      // Post Thumbnail to server
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      fetch(`${apiURL}/content/uploadThumbnail`, {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          const res = await response.json();

          const thumbnailUrl = res.url;

          // Create content with thumbnail URL
          const newContent = {
            creatorUID: auth.getUserUID(),
            title,
            content,
            thumbnailUrl,
          };

          // Post content to server
          fetch(`${apiURL}/content`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newContent),
          })
            .then(async (response) => {
              const res = await response.json();

              if (response.status === 200 || response.status === 201) {
                console.log("Content created successfully");
                // Redirect to home page
                router.push("/");
              } else {
                console.log(res);
                setError("Failed to create content.");
              }
            })
            .catch((error) => {
              console.log(error);
              setError("Failed to create content.");
            });
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to upload thumbnail.");
        });
    } else {
      // Create content without thumbnail URL
      const newContent = {
        creatorUID: auth.getUserUID(),
        title,
        content,
      };

      // Post content to server
      fetch(`${apiURL}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      })
        .then((response) => response.json())
        .then(() => {
          // Redirect to home page
          router.push("/");
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content.");
        });
    }
  }

  if (auth.getUserUID() === null || auth.getToken() === null) {
    console.log("User not authenticated");
    console.log("auth.getUserUID: ", auth.getUserUID());
    console.log("auth.getToken: ", auth.getToken());

    router.push("/authentication/login");
  }

  return (
    <>
      <Navbar />

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
          {/* 
          <label htmlFor='file-upload' className='content-file-upload'>
            Upload Thumbnail
          </label>
          <input
            id='file-upload'
            type='file'
            onChange={(e) =>
              setThumbnail(e.target.files ? e.target.files[0] : null)
            }
          />
          {thumbnail && (
            <>
              <p>Selected file: {thumbnail.name}</p>
              <p>{thumbnail.size}</p>
              <image src={thumbnail.webkitRelativePath} />
            </>
          )} */}

          <label htmlFor='file-upload' className='content-file-upload'>
            Upload Thumbnail
          </label>
          <input
            id='file-upload'
            type='file'
            accept='image/*'
            onChange={handleThumbnailChange}
          />
          {thumbnail && (
            <>
              <p>Selected file: {thumbnail.name}</p>
              <p>File size: {(thumbnail.size / 1024).toFixed(2)} KB</p>
              {thumbnailPreview && (
                <Image
                  src={thumbnailPreview}
                  alt='Thumbnail Preview'
                  width={200}
                  height={200}
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              )}
            </>
          )}
        </form>

        {error && <p className='error-message'>{error}</p>}

        <button className='content-button' onClick={() => handleSubmit()}>
          Published
        </button>
      </div>
    </>
  );
}
