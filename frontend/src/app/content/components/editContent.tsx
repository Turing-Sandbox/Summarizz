"use client";

import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/hooks/AuthProvider";
import "../styles/createContent.scss";
import {useParams, useRouter} from "next/navigation";
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
import { Content } from "../models/Content"

export default function EditContent() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState<Content | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [error, setError] = useState("");

  const auth = useAuth();
  const router = useRouter();

  const contentId = useParams().id;

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
    const getContent = async () => {
      console.log(contentId)
      try {
        const res = await axios.get(`${apiURL}/content/${contentId}`);
        const data = res.data;
        console.log(data)      // setPage(data)
        setPage(data)
        setTitle(data.title)
        setContent(data.content)
        if (page?.content) {
          setContent(page.content);
          if (editor) {
            editor.commands.setContent(page.content);
          }
        }
      } catch (error) {
        setError(error instanceof Error? error.message : String(error)); // Set any error that occurs
      }
    }

    getContent()
    // const savedTitle = localStorage.getItem("title");
    // const savedContent = Cookies.get("content");

    if (page?.title) {
      setTitle(page.title);
    }

    if (page?.content) {
      setContent(page.content);
      if (editor) {
        editor.commands.setContent(page.content);
      }
    }

    console.log(page, content, title)
    console.log("page, content, title")
  }, [editor]);

  useEffect(() => {
    if (page?.content) {
      setContent(page.content);
      if (editor) {
        editor.commands.setContent(page.content);
      }
    }
  }, [editor, page]);


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

  async function handleSubmit() {
    console.log(page)

    // 1 - Reset Error Message
    setError("");

    // 2 - Validate user input
    if (title === "" || content === "") {
      setError("Title and content are required.");
      return;
    }

    // if thumbnail is provided: PUT title, content, time, and thumbnail to update the content and image
    if (thumbnail) {

      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      // save image to FormData
      if (page?.thumbnail){
        const file_path = decodeURIComponent(page.thumbnail.split('/o/')[1].split('?')[0]);
        const file_name = file_path.split("/")[1]
        console.log("FormData Filename: ", file_name)
        formData.append("file_name", file_name)
      }
      // append title, content, and date updated to FormData
      const editData = {title: title, content:content, dateUpdated: new Date()}
      formData.append("data", JSON.stringify(editData))

      try{
        const user_id = auth.getUserUID();
        console.log(formData)
        await axios.put(`${apiURL}/content/editThumbnail/${contentId}/${user_id}`, formData)
        localStorage.removeItem("title");
        Cookies.remove("content");
        router.replace(`../../content/${contentId}?${Date.now()}`)
      } catch (error) {
        setError(error instanceof Error? error.message : String(error)); // Set any error that occurs
      }

    } else {// if thumbnail is not provided: PUT title, content, time, to update only the content

      try{
        const user_id = auth.getUserUID();
        await axios.put(`${apiURL}/content/${contentId}/${user_id}`,
            {data:
                  {
                    title:title,
                    content:content,
                    dateUpdated:Date.now()
                  },
            }
        )
        localStorage.removeItem("title");
        Cookies.remove("content");
        router.replace(`../../content/${contentId}?${Date.now()}`)
      } catch (e){
        throw new Error(e instanceof Error ? e.message : String(e))
      }
    }
  }

  // User must be authenticated to edit content
  if (auth.getUserUID() === null || auth.getToken() === null) {
    router.push("/authentication/login");
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
    router.push(`/content/${contentId}`)
  }

  // --------------------------------------
  // -------------- Render ----------------

  // --------------------------------------
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

          <EditorContent
            editor={editor}
            className='content-input text-editor'
            value={content}
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
            onClick={cancelEdit}
          >
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
