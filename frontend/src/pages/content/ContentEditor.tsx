import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/AuthProvider/useAuth";
import { useNavigate, useParams } from "react-router-dom";
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
import Toolbar from "../../components/content/toolbar";
import axios from "axios";
import { ImageService } from "../../services/ImageService";

export default function ContentEditor({ isEditMode }: { isEditMode: boolean }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const auth = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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

  /*
   * Load saved title and content from localStorage and cookies
   * This will set the title and content in the editor if they exist
   */
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

  /*
   * Fetch existing content if in edit mode
   * This will load the content from the server and set it in the editor
   */
  useEffect(() => {
    if (isEditMode) {
      const fetchContent = async () => {
        try {
          const content = await axios.get(`${apiURL}/content/${id}`, {
            withCredentials: true,
          });

          if (content.data) {
            setTitle(content.data.title);
            setContent(content.data.content);
            if (editor) {
              editor.commands.setContent(content.data.content);
            }
            if (content.data.thumbnail) {
              setThumbnailPreview(content.data.thumbnail);
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

  /*
   * Load thumbnail preview from URL if provided
   * This will convert the URL to a File object and set it as the thumbnail
   * This is useful for editing existing content with a thumbnail
   */
  useEffect(() => {
    let objectUrl: string | null = null;
    if (
      thumbnailPreview &&
      typeof thumbnailPreview === "string" &&
      !thumbnail
    ) {
      (async () => {
        try {
          const file = await urlToFile(
            thumbnailPreview,
            "thumbnail.jpg",
            "image/jpeg"
          );
          setThumbnail(file);
          objectUrl = URL.createObjectURL(file);
          setThumbnailPreview(objectUrl);
        } catch {
          setThumbnail(null);
          setThumbnailPreview(null);
          setError("Failed to load thumbnail image.");
        }
      })();
    } else if (!thumbnailPreview) {
      setThumbnail(null);
      setThumbnailPreview(null);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnailPreview]);

  /*
   * Converts a URL to a File object
   * This is used to convert the thumbnail preview URL to a File object
   * so it can be uploaded to the server
   *
   * @param url - The URL of the image
   * @param filename - The name of the file
   * @param mimeType - The MIME type of the file
   * @returns A Promise that resolves to a File object
   */
  async function urlToFile(
    url: string,
    filename: string,
    mimeType: string
  ): Promise<File> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  }

  /*
   * clearContent() -> void
   *
   * @description
   * Clears the content editor, title, and thumbnail preview.
   */
  const clearContent = () => {
    localStorage.removeItem("title");
    Cookies.remove("content");
    setTitle("");
    setContent("");
    if (editor) {
      editor.commands.setContent("");
    }
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  /*
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

  /*
   * validateForm() -> boolean
   *
   * @description
   * Validates the form to ensure that the title and content are provided.
   * If either is missing, it sets an error message and returns false.
   * @return {boolean} - Returns true if the form is valid, false otherwise.
   */
  const validateForm = () => {
    if (!title || !content) {
      setError(
        "Title and content are required, and were not provided. Please try again."
      );
      return false;
    }
    return true;
  };

  /*
   * submitContent() -> Promise<void>
   *
   * @description
   * Submits the content to the server. If in edit mode, it updates existing content.
   * If not in edit mode, it creates new content.
   *
   * @param payload - The content data to submit
   */
  const submitContent = async (data: Record<string, any>) => {
    if (isEditMode) {
      await axios.put(`${apiURL}/content/${id}`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
    } else {
      await axios.post(`${apiURL}/content`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
    }
  };

  /*
   * handlePostSubmit() -> void
   *
   * @description
   * Handles the post submission logic, clearing local storage and cookies,
   * resetting the form state, and navigating to the content page.
   */
  const handlePostSubmit = () => {
    localStorage.removeItem("title");
    Cookies.remove("content");
    setTitle("");
    setContent("");

    if (id) {
      navigate(`/content/${id}`);
    } else {
      setError("Content ID not found after submission. Please try again.");
    }
  };

  /*
   * handleSubmit() -> void
   *
   * @description
   * Handles the form submission, validates the form, uploads the thumbnail if provided,
   * and submits the content to the server. If successful, it redirects to the content page.
   */
  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) return;

    // Prepare content payload
    const newContent: Record<string, any> = {
      creatorUID: auth.user!.uid,
      title,
      content,
    };

    try {
      // TODO: Move the thumbnail logic to the CONTENT SERVICE when developing the CONTENT SERVICE. 
      if (thumbnail) {
        const thumbnailUploadResponse = await ImageService.uploadThumbnail(
          thumbnail
        );

        if (thumbnailUploadResponse instanceof Error) {
          setError(
            thumbnailUploadResponse.message ||
              "Failed to upload thumbnail. Please try again."
          );
          return;
        }
        newContent.thumbnail = thumbnailUploadResponse.url;
      }
      await submitContent(newContent);
    } catch (error) {
      setError(
        "An error occurred while submitting the content. Please try again."
      );
      return;
    }

    // If submission was successful, redirect to the content page
    if (!error) {
      handlePostSubmit();
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
          <button className='content-button left-button' onClick={clearContent}>
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
