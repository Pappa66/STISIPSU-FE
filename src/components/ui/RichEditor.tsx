'use client';
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface RichEditorProps {
    value: string;
    onChange: (data: string) => void;
}

// Komponen ini tidak diekspor sebagai default
export function RichEditor({ value, onChange }: RichEditorProps) {
    return (
        <CKEditor
            // --- TRIK PERBAIKAN: Casting tipe untuk melewati error ---
            editor={ClassicEditor as any}
            data={value}
            config={{
                ckfinder: {
                    uploadUrl: `${process.env.NEXT_PUBLIC_API_URL}/upload`
                }
            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data);
            }}
        />
    );
}