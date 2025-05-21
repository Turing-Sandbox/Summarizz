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
import Toolbar from "../../components/content/toolbar";

// TODO: Implement Edit/Create Content Logic to adapt this page based on the selected mode.

export default function ContentEditor() {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  // State for Editro and Content
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSummarizing, setIsSummarizing] = useState(false);
  const auth = useAuth();
  const { user } = useAuth();
  const [error, setError] = useState("");
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
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

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
   * handleSummarize() -> void
   *
   * @description
   * Handles the summarization of the content using the AI service backend,
   * this will set the isSummarizing state to true and then call the backend
   * to summarize the content using the API. If the content is not provided,
   * it will set an error message and return.
   *
   * @returns {Promise<void>}
   */
  const handleSummarize = async () => {
    if (!content) {
      setError(
        "Please add some content before summarizing using our AI service."
      );
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch(`${apiURL}/api/v1/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to summarize provided content. Please Try again."
        );
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
      setError(
        `Failed to summarize provided content: ${
          (error as Error).message
        }, something went wrong. Please Try again.`
      );
    }

    setIsSummarizing(false);
  };

  /**
   * handleSubmit() -> void
   *
   * @description
   * Handles the submission of the content, setting { title, content, thumbnail }
   * respectively amnd redirecting to the Content page. If the title and content
   * are not provided, it will throw an error and set the error state to the current
   * error message based on the error thrown.
   *
   * @returns
   */
  function handleSubmit() {
    setError("");

    if (title === "" || content === "") {
      setError(
        "Title and content are required, and were not provided. Please Try again."
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newContent: Record<string, any> = {
      creatorUID: user!.uid,
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
            navigate("/");
          } else {
            setError("Failed to create content. Please Try again.");
          }
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content. Please Try again.");
        });
    } else {
      fetch(`${apiURL}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      })
        .then((response) => response.json())
        .then(async () => {
          Cookies.remove("content");
          localStorage.removeItem("title");
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
          setError("Failed to create content. Please Try again.");
        });
    }
  }

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
        <h1>Create Content</h1>

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
