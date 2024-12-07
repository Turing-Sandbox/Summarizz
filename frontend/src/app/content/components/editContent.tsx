"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import "../styles/createContent.scss";
import { useParams, useRouter } from "next/navigation";
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
import axios from "axios";
import { Content } from "../models/Content";

export default function EditContent() {
  // Hooks must always be in the same order and not inside conditionals.
  const { user, userUID, loading } = useAuth();
  const router = useRouter();
  const contentId = useParams().id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState<Content | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Initialize editor first
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

  // Effect to handle authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/authentication/login");
    }
  }, [user, loading, router]);

  // Effect to fetch content once editor and user are ready
  useEffect(() => {
    if (!loading && user && editor) {
      const getContent = async () => {
        try {
          const res = await axios.get(`${apiURL}/content/${contentId}`);
          const data = res.data;
          setPage(data);
          setTitle(data.title);
          setContent(data.content);
          editor.commands.setContent(data.content);
        } catch (err: any) {
          setError(err.message || "Failed to fetch content.");
        }
      };
      getContent();
    }
  }, [editor, loading, user, contentId]);

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

  async function handleSubmit() {
    setError("");

    if (title === "" || content === "") {
      setError("Title and content are required.");
      return;
    }

    try {
      const user_id = userUID;
      if (!user_id || !contentId) {
        setError("Missing user or content information.");
        return;
      }

      if (thumbnail) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnail);

        if (page?.thumbnail) {
          const file_path = decodeURIComponent(page.thumbnail.split("/o/")[1].split("?")[0]);
          const file_name = file_path.split("/")[1];
          formData.append("file_name", file_name);
        }

        const editData = { title: title, content: content, dateUpdated: new Date() };
        formData.append("data", JSON.stringify(editData));

        await axios.put(`${apiURL}/content/editThumbnail/${contentId}/${user_id}`, formData);
      } else {
        await axios.put(`${apiURL}/content/${contentId}/${user_id}`, {
          data: {
            title: title,
            content: content,
            dateUpdated: Date.now(),
          },
        });
      }

      localStorage.removeItem("title");
      Cookies.remove("content");
      router.replace(`../../content/${contentId}?${Date.now()}`);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to update content.");
    }
  }

  function cancelEdit() {
    localStorage.removeItem("title");
    Cookies.remove("content");
    setTitle("");
    setContent("");
    if (editor) {
      editor.commands.setContent("");
    }
    setThumbnail(null);
    setThumbnailPreview(null);
    router.push(`/content/${contentId}`);
  }

  // If still loading auth state, show a loading message
  if (loading) {
    return <p>Loading...</p>;
  }

  // If user is null after loading, it means redirect has started. Don't render the rest.
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />

      <div className='main-content'>
        <h1>Edit Content</h1>

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
          <button className='content-button left-button' onClick={cancelEdit}>
            Cancel
          </button>
          <button className='content-button' onClick={() => handleSubmit()}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
