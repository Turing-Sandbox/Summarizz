"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import { apiAIURL, apiURL } from "@/app/scripts/api";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Toolbar from "./toolbar";
import "../styles/createContent.scss";

export default function CreateContent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { user, loading } = useAuth(); 
  const [error, setError] = useState("");
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

  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    const savedContent = Cookies.get("content");

    if (savedTitle) {
      setTitle(savedTitle);
    }

    if (savedContent && editor) {
      setContent(savedContent);
      editor.commands.setContent(savedContent);
    }
  }, [editor]);

  useEffect(() => {
    // Only redirect after we know loading is false
    if (!loading && !user) {
      router.push("/authentication/login");
    }
  }, [user, loading, router]);

  // If still loading auth state, show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If user is null after loading, the redirect already happened in useEffect
  if (!user) {
    return null; 
  }

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

  const handleSummarize = async () => {
    if (!content) {
      setError("Please add content before summarizing.");
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch(`${apiAIURL}/api/v1/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to summarize provided content.");
      }

      if (!editor) {
        return;
      }

      const formattedSummary = `
        <div class="summary-container">
          <h2 class="summary-title">Summary</h2>
          <div class="summary-content">
            <p>${data.summary.output.replace(/\n/g, "</p><p>")}</p>
          </div>
        </div>
      `;

      editor.commands.setContent(formattedSummary);
      setContent(formattedSummary);
      Cookies.set("content", formattedSummary);

    } catch (error) {
      console.error(error);
      setError(`Failed to summarize provided content: ${error}`);
    }

    setIsSummarizing(false);
  };

  function handleSubmit() {
    setError("");

    if (title === "" || content === "") {
      setError("Title and content are required.");
      return;
    }

    if (!user) {
      setError("No user is signed in.");
      return;
    }

    const newContent: Record<string, any> = {
      creatorUID: user.uid,
      title,
      content,
    };

    if (thumbnail) {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);

      fetch(`${apiURL}/content/uploadThumbnail`, {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          const res = await response.json();
          const thumbnailUrl = res.url;
          newContent["thumbnailUrl"] = thumbnailUrl;

          return fetch(`${apiURL}/content`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContent),
          });
        })
        .then(async (response) => {
          if (response.status === 200 || response.status === 201) {
            Cookies.remove("content");
            localStorage.removeItem("title");
            router.push("/");
          } else {
            setError("Failed to create content.");
          }
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content.");
        });
    } else {
      fetch(`${apiURL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      })
        .then((response) => response.json())
        .then(() => {
          Cookies.remove("content");
          localStorage.removeItem("title");
          router.push("/");
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content.");
        });
    }
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

          <EditorContent editor={editor} className='content-input text-editor' />
          <a
            onClick={() => {
              setContent("");
              Cookies.remove("content");
            }}
            className='clear-button'
          >
            Clear
          </a>

          {thumbnail && thumbnailPreview && (
            <Image
              src={thumbnailPreview}
              alt='Thumbnail Preview'
              width={200}
              height={200}
              className='thumbnail-preview'
            />
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
          <button className='content-button' onClick={handleSummarize}>
            Summarize with AI
          </button>
          <button className='content-button' onClick={handleSubmit}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
