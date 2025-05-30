import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// TipTap (Import)
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { apiURL } from "../../scripts/api";
import axios from "axios";
import Toolbar from "../../components/content/toolbar";

export default function ContentEditor({ isEditMode }: { isEditMode: boolean }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const auth = useAuth();
  const navigate = useNavigate();

  // Initialize Editor
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

    if (savedContent && editor) {
      setContent(savedContent);
      editor.commands.setContent(savedContent);
    }
  }, [editor]);

  // Fetch existing content data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Fetch existing content data if in edit mode
      const fetchContent = async () => {
        try {
          const content = await axios.get(
            `${apiURL}/content/${window.location.pathname.split("/").pop()}`,
            {
              withCredentials: true,
            }
          );

          if (content.data) {
            setTitle(content.data.title);
            setContent(content.data.content);
            if (editor) {
              editor.commands.setContent(content.data.content);
            }
            if (content.data.thumbnailUrl) {
              setThumbnailPreview(content.data.thumbnailUrl);
            }
          } else {
            setError("Failed to load content. Please try again.");
          }
        } catch {
          setError("Failed to load content. Please try again.");
        }
      };

      fetchContent();
    }
  }, [isEditMode, editor]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------

  /**
   * handleThumbnailChange() -> void
   *
   * @description
   * Handles the file upload for the thumbnail, and sets the thumbnail preview
   * to the file that was uploaded. If the file is not an image, or one was not provided, it
   * will throw and error indicating that the thumbnail was not set and to try again.
   *
   * @param e - Change Event for Thumbnail File
   */
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

  /**
   * Handles the submission of the content, including thumbnail upload and notifications.
   * Uses POST for create and PUT for update mode.
   */
  const handleSubmit = async () => {
    setError("");

    if (!title || !content) {
      setError(
        "Title and content are required, and were not provided. Please try again."
      );
      return;
    }

    try {
      // Prepare content payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newContent: Record<string, any> = {
        creatorUID: auth.user!.uid,
        title,
        content,
      };

      // Handle thumbnail upload if present
      if (thumbnail) {
        const formData = new FormData();
        formData.append("thumbnail", thumbnail);
        const thumbRes = await axios.post(
          `${apiURL}/content/uploadThumbnail`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        newContent.thumbnailUrl = thumbRes.data.url;
      }

      // Determine request method and URL
      let response;
      if (isEditMode) {
        const contentId = window.location.pathname.split("/").pop();
        response = await axios.put(
          `${apiURL}/content/${contentId}`,
          newContent,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(`${apiURL}/content`, newContent, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
      }

      // Notify followers if content creation/update was successful
      if (response.status === 200 || response.status === 201) {
        Cookies.remove("content");
        localStorage.removeItem("title");
        navigate("/");
      } else {
        setError("Failed to save content. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save content. Please try again.");
    }
  };

  // User must be authenticated to create content
  if (!auth.isAuthenticated) {
    navigate("/authentication/login");
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <div className='main-content'>
        <h1>{isEditMode ? "Edit" : "Create"} Content</h1>

        <form className='create-content-form'>
          <input
            className='content-input'
            type='text'
            id='title'
            name='title'
            value={title}
            onChange={(e) => {
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;
              setTitle(e.target.value);
              localStorage.setItem("title", e.target.value);
            }}
            placeholder='Title'
          />
          <a
            onClick={() => {
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;
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
            <img
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
              // Only proceed if we're in the browser environment
              if (typeof window === "undefined") return;

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

          <button className='content-button' onClick={handleSubmit}>
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
