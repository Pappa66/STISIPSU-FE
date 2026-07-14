"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import {
  FaUndo,
  FaRedo,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaHighlighter,
  FaSubscript,
  FaSuperscript,
  FaHeading,
  FaListUl,
  FaListOl,
  FaTasks,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaImage,
  FaLink,
  FaEraser,
} from "react-icons/fa";
import clsx from "clsx";

// ===== Toolbar ====
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const MenuButton = ({
    onClick,
    title,
    isActive,
    children,
  }: {
    onClick: () => void;
    title: string;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "px-3 py-1 text-sm font-medium rounded-md transition-colors",
        "hover:bg-sky-50 text-sky-700 border border-sky-600",
        { "bg-sky-600 text-white": isActive }
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b bg-sky-50 rounded-t-md">
      <MenuButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <FaUndo />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <FaRedo />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
        isActive={editor.isActive("bold")}
      >
        <FaBold />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
        isActive={editor.isActive("italic")}
      >
        <FaItalic />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
        isActive={editor.isActive("underline")}
      >
        <FaUnderline />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
        isActive={editor.isActive("strike")}
      >
        <FaStrikethrough />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        title="Highlight"
        isActive={editor.isActive("highlight")}
      >
        <FaHighlighter />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        title="Subscript"
        isActive={editor.isActive("subscript")}
      >
        <FaSubscript />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        title="Superscript"
        isActive={editor.isActive("superscript")}
      >
        <FaSuperscript />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
        isActive={editor.isActive("heading", { level: 2 })}
      >
        <FaHeading />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
        isActive={editor.isActive("bulletList")}
      >
        <FaListUl />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
        isActive={editor.isActive("orderedList")}
      >
        <FaListOl />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task List"
        isActive={editor.isActive("taskList")}
      >
        <FaTasks />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
        isActive={editor.isActive({ textAlign: "left" })}
      >
        <FaAlignLeft />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
        isActive={editor.isActive({ textAlign: "center" })}
      >
        <FaAlignCenter />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
        isActive={editor.isActive({ textAlign: "right" })}
      >
        <FaAlignRight />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        title="Justify"
        isActive={editor.isActive({ textAlign: "justify" })}
      >
        <FaAlignJustify />
      </MenuButton>
      <MenuButton
        onClick={() => {
          const url = prompt("Enter image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="Insert Image"
      >
        <FaImage />
      </MenuButton>
      {/* <MenuButton
        onClick={() => {
          const url = prompt("Enter link URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        title="Insert Link"
      >
        <FaLink />
      </MenuButton> */}
      <MenuButton
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Clear Formatting"
      >
        <FaEraser />
      </MenuButton>
    </div>
  );
};

// ===== Main Editor ====
const TipTapEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      FontFamily,
      Highlight,
      Subscript,
      Superscript,
      Image,
      Link,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none p-4 focus:outline-none min-h-[250px] text-black break-words whitespace-pre-wrap prose-ul:list-disc prose-ol:list-decimal prose-li:ml-6",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className="border rounded-lg bg-white shadow">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
