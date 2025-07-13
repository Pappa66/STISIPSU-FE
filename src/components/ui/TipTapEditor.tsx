'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect } from 'react';
import clsx from 'clsx';

// MenuBar berisi semua tombol formatting
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  // Fungsi untuk membuat tombol
  const MenuButton = ({ onClick, title, isActive, children }: { onClick: () => void; title: string; isActive: boolean; children: React.ReactNode }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={clsx(
          "p-2 text-sm font-medium rounded-md hover:bg-slate-200 disabled:opacity-50",
          { 'bg-slate-300 text-slate-800': isActive }
        )}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 p-2 border-b bg-slate-50">
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" isActive={editor.isActive('bold')}>
        Bold
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" isActive={editor.isActive('italic')}>
        Italic
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Judul" isActive={editor.isActive('heading', { level: 2 })}>
        Judul
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} title="List" isActive={editor.isActive('bulletList')}>
        List
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Nomor" isActive={editor.isActive('orderedList')}>
        Nomor
      </MenuButton>
    </div>
  );
};

// Komponen Editor Utama
const TipTapEditor = ({ value, onChange }: { value: string; onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
        StarterKit.configure({
            // Nonaktifkan heading level 1 jika Anda ingin judul utama diatur oleh field terpisah
            heading: {
                levels: [2, 3],
            },
        }),
    ],
    content: value,
    // Menghilangkan warning SSR
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // Class `prose` dari @tailwindcss/typography akan memberi style pada HTML
        class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[250px]',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sinkronkan konten editor jika 'value' dari parent berubah
  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className="border rounded-md bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
