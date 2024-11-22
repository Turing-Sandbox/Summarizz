import { Editor } from "@tiptap/react";
import "../styles/toolbar.scss";

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className='toolbar'>
      <button
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
      </button>

      <hr />

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
      >
        Bold
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-button ${
          editor.isActive("italic") ? "active" : ""
        }`}
      >
        Italic
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${
          editor.isActive("underline") ? "active" : ""
        }`}
      >
        Underline
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`toolbar-button ${editor.isActive("code") ? "active" : ""}`}
      >
        Code
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
        Block Code
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

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${
          editor.isActive("bulletList") ? "active" : ""
        }`}
      >
        Bullet List
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${
          editor.isActive("orderedList") ? "active" : ""
        }`}
      >
        Ordered List
      </button>
    </div>
  );
}
