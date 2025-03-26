"use client";

// React & NextJs (Import)
import { useState, useEffect } from "react";
import Image from "next/image";

// TipTap (Import)
import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";

// Stylesheets (Import)
import "@/app/styles/content/toolbar.scss";

// ToolbarProps for Toolbar
interface ToolbarProps {
  editor: Editor | null;
}

// Heading Levels for Toolbar (1-6)
const headingLevels = [
  { key: 0, value: "0", label: "Paragraph" },
  { key: 1, value: "1", label: "Header 1" },
  { key: 2, value: "2", label: "Header 2" },
  { key: 3, value: "3", label: "Header 3" },
  { key: 4, value: "4", label: "Header 4" },
  { key: 5, value: "5", label: "Header 5" },
  { key: 6, value: "6", label: "Header 6" },
];

/**
 * Toolbar() -> JSX.Element
 *
 * @description
 * This function renders the Toolbar component, allowing users to format their content or
 * add headings, lists, and other formatting options.
 *
 * @param editor - TipTap Editor (ToolbarProps)
 * @returns JSX.Element
 */
export default function Toolbar({ editor }: ToolbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  {
    /*ANCHOR - Fix this Code, Light Mode / Dark Mode is not Actively Working. */
  }

  // EFFECT: Handle Dark Mode Preference for Formatting Options
  useEffect(() => {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

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
        document.documentElement.setAttribute(
          "data-theme",
          isDark ? "dark" : "light"
        );
        setIsDarkMode(isDark);
      };

      mq.addEventListener("change", handleChange);

      return () => mq.removeEventListener("change", handleChange);
    }
  }, []);

  // If the editor is not available, return.
  if (!editor) {
    return null;
  }

  /**
   * handelHeadingChange() -> void
   *
   * @description
   * Handles the change of the heading level, setting the heading level
   * based on user's selection. If the user selects "Paragraph", it will
   * set the paragraph style. If the user selects a heading level, it
   * will set the heading style, and so on.
   *
   * @param event - Change Event for HTMLSelectElement
   */
  const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "0") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value, 10) as Level;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  /**
   * activeHeadingLevel() -> number
   *
   * @description
   * Determines the current heading level that is active in the editor.
   * If no heading is active, it checks if a paragraph is active and
   * returns 0 in that case. If neither a heading nor a paragraph is active,
   * it returns an empty string.
   *
   * @returns {number} - The active heading level (1-6 for headings, 0 for paragraph),
   * or an empty string if neither is active.
   */
  const activeHeadingLevel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) {
        return i;
      }
    }

    return editor.isActive("paragraph") ? 0 : "";
  };

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
        type='button'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${
          editor.isActive("bulletList") ? "active" : ""
        }`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/orderedListIcon-light.png"
              : "/images/orderedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt='Unordered List'
        />
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${
          editor.isActive("orderedList") ? "active" : ""
        }`}
      >
        <Image
          src={
            isDarkMode
              ? "/images/numberedListIcon-light.png"
              : "/images/numberedListIcon-dark.png"
          }
          width={20}
          height={20}
          alt='Ordered List'
        />
      </button>
    </div>
  );
}
