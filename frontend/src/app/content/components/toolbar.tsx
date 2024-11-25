import { Editor } from "@tiptap/react";
import "../styles/toolbar.scss";
import { Level } from "@tiptap/extension-heading";
import Image from "next/image";

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
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

  return (
    <div className='toolbar'>
      {/* <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`toolbar-button ${
          editor.isActive("heading", { level: 1 }) ? "active" : ""
        }`}
      >
        Header 1
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`toolbar-button ${
          editor.isActive("heading", { level: 2 }) ? "active" : ""
        }`}
      >
        Header 2
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={`toolbar-button ${
          editor.isActive("heading", { level: 3 }) ? "active" : ""
        }`}
      >
        Header 3
      </button> */}
      <select
        onChange={handleHeadingChange}
        className='toolbar-dropdown'
        value={
          editor.isActive("paragraph")
            ? "0"
            : editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
            ? "2"
            : editor.isActive("heading", { level: 3 })
            ? "3"
            : ""
        }
      >
        <option value='0'>Paragraph</option>
        <option value='1'>Header 1</option>
        <option value='2'>Header 2</option>
        <option value='3'>Header 3</option>
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

      {/* <button
        type='button'
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`toolbar-button ${editor.isActive("code") ? "active" : ""}`}
      >
        Code
      </button> */}

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
        {/* If Dark Mode on */}
        <Image
          src='/images/orderedListIcon-light.png'
          width={20}
          height={20}
          alt='Unordered List'
        />

        {/* If Light Mode on */}
        <Image
          src='/images/orderedListIcon-dark.png'
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
        {/* if Dark Mode on */}
        <Image
          src='/images/numberedListIcon-light.png'
          width={20}
          height={20}
          alt='Ordered List'
        />

        {/* if Light Mode on */}
        <Image
          src='/images/numberedListIcon-dark.png'
          width={20}
          height={20}
          alt='Ordered List'
        />
      </button>
    </div>
  );
}
