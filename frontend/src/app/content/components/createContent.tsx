"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import "../styles/createContent.scss";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { apiURL } from "@/app/scripts/api";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Toolbar from "./toolbar";
import Cookies from "js-cookie";
import Paragraph from "@tiptap/extension-paragraph";

export default function CreateContent() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [error, setError] = useState("");

  const auth = useAuth();
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Paragraph,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      Cookies.set("content", html);
    },
  });

  // ---------------------------------------
  // ----------- Event Handlers ------------
  // ---------------------------------------
  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    const savedContent = Cookies.get("content");

    if (savedTitle) {
      setTitle(savedTitle);
    }

    if (savedContent) {
      setContent(savedContent);
      if (editor) {
        editor.commands.setContent(savedContent);
      }
    }
  }, [editor]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
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

  function handleSubmit() {
    // 1 - Reset Error Message
    setError("");

    // 2 - Validate user input
    if (title === "" || content === "") {
      setError("Title and content are required.");
      return;
    }

    if (thumbnail) {
      // 3 - Post Thumbnail to server
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      fetch(`${apiURL}/content/uploadThumbnail`, {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          const res = await response.json();

          const thumbnailUrl = res.url;

          // 4 - Create content with thumbnail URL
          const newContent = {
            creatorUID: auth.getUserUID(),
            title,
            content,
            thumbnailUrl,
          };

          // 5 - Post content to server
          fetch(`${apiURL}/content`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newContent),
          })
            .then(async (response) => {
              // const res = await response.json();

              // 6 - Redirect to home page
              if (response.status === 200 || response.status === 201) {
                Cookies.remove("content");
                localStorage.removeItem("title");
                router.push("/");

                // 7 - Error Handling
              } else {
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
      // 3 - Create content without thumbnail URL
      const newContent = {
        creatorUID: auth.getUserUID(),
        title,
        content,
      };

      // 4 - Post content to server
      fetch(`${apiURL}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      })
        .then((response) => response.json())
        .then(() => {
          Cookies.remove("content");
          localStorage.removeItem("title");
          // 5 - Redirect to home page
          router.push("/");
        })
        // 6 - Error Handling
        .catch((error) => {
          console.log(error);
          setError("Failed to create content.");
        });
    }
  }

  // User must be authenticated to create content
  if (auth.getUserUID() === null || auth.getToken() === null) {
    router.push("/authentication/login");
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
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
            onChange={(e) => {
              setTitle(e.target.value);
              localStorage.setItem("title", e.target.value);
            }}
            placeholder='Title'
          />
          <a
            onClick={() => {
              setTitle("");
              localStorage.removeItem("title");
            }}
            className='clear-button'
          >
            Clear
          </a>

          <Toolbar editor={editor} />

          <EditorContent
            editor={editor}
            className='content-input text-editor'
          />
          <a
            onClick={() => {
              setContent("");
              Cookies.remove("content");
            }}
            className='clear-button'
          >
            Clear
          </a>

          {thumbnail && (
            <>
              {thumbnailPreview && (
                <Image
                  src={thumbnailPreview}
                  alt='Thumbnail Preview'
                  width={200}
                  height={200}
                  className='thumbnail-preview'
                />
              )}
            </>
          )}
          <div>
            <label htmlFor='file-upload' className='content-file-upload'>
              {thumbnail ? "Change" : "Upload"} Thumbnail
            </label>
            <input
              id='file-upload'
              type='file'
              accept='image/*'
              onChange={handleThumbnailChange}
            />
          </div>
        </form>

        {error && <p className='error-message'>{error}</p>}

        <div className='form-buttons'>
          <button
            className='content-button left-button'
            onClick={() => {
              localStorage.removeItem("title");
              Cookies.remove("content");
              setTitle("");
              setContent("");
              if (editor) {
                editor.commands.setContent("");
              }
              setThumbnail(null);
              setThumbnailPreview(null);
            }}
          >
            Clear
          </button>
          <button className='content-button' onClick={() => handleSubmit()}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
