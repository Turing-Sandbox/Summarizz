import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

import "../styles/toolbar.scss";

interface ToolbarProps {
  editor: Editor | null;
}

const headingLevels = [
  { key: 0, value: "0", label: "Paragraph" },
  { key: 1, value: "1", label: "Header 1" },
  { key: 2, value: "2", label: "Header 2" },
  { key: 3, value: "3", label: "Header 3" },
  { key: 4, value: "4", label: "Header 4" },
  { key: 5, value: "5", label: "Header 5" },
  { key: 6, value: "6", label: "Header 6" },
]

export default function Toolbar({ editor }: ToolbarProps) {
  const [isDarkMode , setIsDarkMode] = useState(false);
  const [formattedMarkdown, setFormattedMarkdown] = useState("");

  {/*ANCHOR - Fix this Code, Light Mode / Dark Mode is not Actively Working. */}
  useEffect(() => {
    const preferenceMode = localStorage.getItem("isDarkMode");
  
    if (preferenceMode === "true") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDarkMode(true);

    } else if (preferenceMode === "false") {
      document.documentElement.setAttribute("data-theme", "light");
      setIsDarkMode(false);

    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
  
      if (mq.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        setIsDarkMode(false);
      }
  
      const handleChange = (evt: any) => {
        const isDark = evt.matches;
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
        setIsDarkMode(isDark);
      };
  
      mq.addEventListener("change", handleChange);
  
      return () => mq.removeEventListener("change", handleChange);
    }
  }, []);

  if (!editor) {
    return null;
  }

  const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "0") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value, 10) as Level;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const activeHeadingLevel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) {
        return i;
      }
    }

    return editor.isActive("paragraph") ? 0 : "";
  }

  return (
    <div className='toolbar'>
      <select
        onChange={handleHeadingChange}
        className='toolbar-dropdown'
        value={activeHeadingLevel()}
      >
       
       {headingLevels.map(({ key, value, label }) => (
          <option key={key} value={value}>
            {label}
          </option>
        ))}
      </select>

      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-button ${
          editor.isActive("bold") ? "active" : ""
        } small-button`}
      >
        <b>B</b>
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-button ${
          editor.isActive("italic") ? "active" : ""
        } small-button`}
      >
        <i>I</i>
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${
          editor.isActive("underline") ? "active" : ""
        } small-button`}
      >
        <u>U</u>
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`toolbar-button ${
          editor.isActive("strike") ? "active" : ""
        } small-button`}
      >
        <s>S</s>
      </button>
      
      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        className={`toolbar-button ${
          editor.isActive("codeBlock") ? "active" : ""
        }`}
      >
        &lt;/&gt;
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={!editor.can().chain().focus().toggleBlockquote().run()}
        className={`toolbar-button ${
          editor.isActive("blockquote") ? "active" : ""
        }`}
      >
        Quote
      </button>

      <hr />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/orderedListIcon-light.png"
              : "/images/orderedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt="Unordered List"
        />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/numberedListIcon-light.png"
              : "/images/numberedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt="Ordered List"
        />
      </button>

      <hr />
    </div>
  );
}
