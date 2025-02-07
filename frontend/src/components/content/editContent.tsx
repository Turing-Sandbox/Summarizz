"use client";

import "../styles/createContent.scss";
// React & NextJs (Import)
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Third-Party Libraries (Import)
import axios from "axios";
import Cookies from "js-cookie";

// TipTap (Import)
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";

// Local Files (Import)
import { useAuth } from "@/hooks/AuthProvider";
import { apiURL } from "@/app/scripts/api";
import { Content } from "../../models/Content";
import Toolbar from "./toolbar";

// Stylesheets (Import)
import "../styles/createContent.scss";
import Navbar from "../Navbar";

/**
 * EditContent() -> JSX.Element
 *
 * @description
 * This function renders the Edit Content page, allowing users to edit their
 * content with the ability to change the { title, content, and thumbnail }.
 *
 * @returns JSX.Element
 */
export default function EditContent() {
  // Hooks for Authentication and Routing
  const { user, userUID, loading } = useAuth();
  const router = useRouter();
  const contentId = useParams().id;

  // State for Editor and Content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState<Content | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Initialization of Editor
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

  // EFFECT: Handle User Authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/authentication/login");
    }
  }, [user, loading, router]);

  // EFFECT: Fetch Content once Editor and User are ready
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setError(err.message || "Failed to fetch content. Please try again.");
        }
      };
      getContent();
    }
  }, [editor, loading, user, contentId]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------

  /**
   * handleThumbnailChange() -> void
   *
   * @description
   * This function handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for File
   */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnail(null);
      setThumbnailPreview(null);
      setError(
        "Please select a valid image file, thumbnail was not edited. Please Try again."
      );
    }
  };

  /**
   * handleSubmit() -> async
   *
   * @description
   * This function handles the submission of the content, handling and setting the
   * title, content, and thumbnail. If the title and content are not provided, it will
   * throw an error and set the error state to the current error message based on the
   * error thrown. If everything is successful, it will set { title, content, thumbnail }.
   *
   * @returns null
   */
  const handleSubmit = async () => {
    setError("");

    if (title === "" || content === "") {
      setError(
        "Title and content are required, and was not provided. Please Try again."
      );
      return;
    }

    try {
      const user_id = userUID;
      if (!user_id || !contentId) {
        setError("Missing user or content information. Please Try again.");
        return;
      }

      if (thumbnail) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnail);

        if (page?.thumbnail) {
          const file_path = decodeURIComponent(
            page.thumbnail.split("/o/")[1].split("?")[0]
          );
          const file_name = file_path.split("/")[1];
          formData.append("file_name", file_name);
        }

        const editData = {
          title: title,
          content: content,
          dateUpdated: new Date(),
        };
        formData.append("data", JSON.stringify(editData));

        await axios.put(
          `${apiURL}/content/editThumbnail/${contentId}/${user_id}`,
          formData
        );
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(
        error.message ||
          "Something went wrong, we are unable to update the content. Please Try again."
      );
    }
  };

  /**
   * cancelEdit() -> void
   *
   * @description
   * This function handles the cancellation of the edit, removing all changes made to
   * { content, title, thumbnail } and redirecting to the content page.
   *
   * @returns null
   */
  const cancelEdit = () => {
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
  };

  // NOTE: If the auth state is still loading, show a loading message.
  if (loading) {
    return <p>Loading...</p>;
  }

  // NOTE: If the user is null after loading, it means redirect has started. Don't render the rest.
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
