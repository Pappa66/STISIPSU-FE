'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import useSWR, { mutate } from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { ArrowLeft, GripVertical, Image as ImageIcon, Pilcrow, Type, Trash2, Youtube, UploadCloud, Code2, Settings } from 'lucide-react';
import Image from 'next/image';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TipTapEditor from '@/components/ui/TipTapEditor';

type Block = 
    | { id: string; type: 'heading'; content: string }
    | { id: string; type: 'paragraph'; content: string }
    | { id: string; type: 'image' | 'video'; url: string }
    | { id: string; type: 'youtube'; url: string }
    | { id: string; type: 'html'; content: string };

// --- PERBAIKAN: Hapus 'extends Post' karena tidak diperlukan dan menyebabkan error ---
interface PostWithMeta {
    id: string;
    title: string;
    slug: string | null;
    featuredImageUrl: string | null;
    blocks: Block[] | null;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json());

function SortableBlock({ block, onUpdate, onRemove, onInitiateUpload, isUploading }: { 
    block: Block; 
    onUpdate: (id: string, value: string) => void; 
    onRemove: (id: string) => void;
    onInitiateUpload: (id: string, type: 'image' | 'video') => void;
    isUploading: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const fullUrl = (path: string) => path.startsWith('http') ? path : new URL(path, baseUrl).href;
    
    const renderBlock = () => {
        if (isUploading) {
            return (
                <div className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center">
                    <Spinner />
                    <p className="text-sm text-slate-500 mt-2">Mengunggah...</p>
                </div>
            );
        }
        switch (block.type) {
            case 'heading': return <input type="text" value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="Tulis Judul..." className="text-3xl font-bold w-full focus:outline-none bg-transparent"/>;
            case 'paragraph': return <TipTapEditor value={block.content} onChange={(newContent) => onUpdate(block.id, newContent)} />;
            case 'image': if (!block.url) return <div onClick={() => onInitiateUpload(block.id, 'image')} className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200"><UploadCloud size={32} className="text-slate-400" /><p className="text-sm text-slate-500 mt-2">Klik untuk mengunggah gambar</p></div>; return <div className="relative w-full h-64 bg-slate-200 rounded-md overflow-hidden"><Image src={fullUrl(block.url)} alt="Konten Gambar" fill style={{ objectFit: 'contain' }} /></div>;
            case 'video': if (!block.url) return <div onClick={() => onInitiateUpload(block.id, 'video')} className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200"><UploadCloud size={32} className="text-slate-400" /><p className="text-sm text-slate-500 mt-2">Klik untuk mengunggah video</p></div>; return <video src={fullUrl(block.url)} controls className="w-full rounded-md" />;
            case 'youtube': const videoId = block.url.split('v=')[1]?.split('&')[0] || block.url.split('/').pop(); if (!videoId) return <input type="text" value={block.url} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="Masukkan URL YouTube..." className="w-full focus:outline-none bg-transparent" />; return <iframe src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allowFullScreen className="w-full aspect-video rounded-md"></iframe>;
            case 'html': return (<div className="w-full"><label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Blok HTML Kustom</label><textarea value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} placeholder="Tulis atau tempel kode HTML di sini..." className="w-full h-48 p-3 border rounded-md font-mono text-sm bg-gray-900 text-green-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" /><p className="text-xs text-gray-400 mt-1 ml-1">Gunakan untuk embed atau layout khusus. Hati-hati dengan kode yang Anda masukkan.</p></div>);
            default: return null;
        }
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 p-3 bg-white border rounded-lg shadow-sm">
            <button {...listeners} className="cursor-grab p-2 text-slate-400 hover:bg-slate-100 rounded-md mt-1"><GripVertical size={18} /></button>
            <div className="flex-grow">{renderBlock()}</div>
            <button onClick={() => onRemove(block.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md mt-1"><Trash2 size={18} /></button>
        </div>
    );
}

export default function EditorPage() {
    const params = useParams();
    const postId = params.postId as string;
    const router = useRouter();
    
    // State untuk konten blok
    const [blocks, setBlocks] = useState<Block[]>([]);
    
    // State baru untuk metadata
    const [slug, setSlug] = useState('');
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
    
    // Ref untuk upload file
    const contentFileInputRef = useRef<HTMLInputElement>(null);
    const featuredImageInputRef = useRef<HTMLInputElement>(null); // Ref baru untuk featured image
    const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}`;
    const { data: post, error, isLoading } = useSWR<PostWithMeta>(apiUrl, fetcher);

    useEffect(() => {
        if (post) {
            // Mengisi konten blok
            if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
                setBlocks(post.blocks);
            } else {
                setBlocks([{ id: `heading-${Date.now()}`, type: 'heading', content: post.title || 'Judul Baru' }]);
            }
            // Mengisi metadata
            setSlug(post.slug || '');
            setFeaturedImageUrl(post.featuredImageUrl || null);
        }
    }, [post]);

    // Fungsi untuk membuat slug otomatis dari judul
    const generateSlug = (text: string) => {
        return text.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    };

    // Fungsi untuk upload gambar di dalam konten (tetap sama)
    const handleInitiateUpload = (blockId: string, type: 'image' | 'video') => {
        setUploadingBlockId(blockId);
        if (contentFileInputRef.current) {
            contentFileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/mp4,video/webm';
            contentFileInputRef.current.click();
        }
    };
    const handleContentFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingBlockId) return;
        const formData = new FormData();
        formData.append('upload', file);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            setBlocks(prev => prev.map(b => b.id === uploadingBlockId ? { ...b, url: data.url } : b) as Block[]);
        } catch (err) { alert('Upload gagal.'); } 
        finally { setUploadingBlockId(null); if(contentFileInputRef.current) contentFileInputRef.current.value = ""; }
    };

    // Logika baru untuk upload Gambar Unggulan
    const handleFeaturedImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFeatured(true);
        const formData = new FormData();
        formData.append('upload', file); // 'upload' harus sesuai dengan nama field di backend (multer)
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            setFeaturedImageUrl(data.url); // Simpan URL gambar yang baru diupload
        } catch (err) {
            alert('Upload Gambar Unggulan gagal.');
        } finally {
            setIsUploadingFeatured(false);
        }
    };
    
    // Handler untuk perubahan input slug
    const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSlug(generateSlug(e.target.value)); // Otomatis format slug saat diketik
    };
    
    const addBlock = (type: Block['type']) => {
        let newBlock: Block;
        if (type === 'image') newBlock = { id: `img-${Date.now()}`, type, url: '' };
        else if (type === 'video') newBlock = { id: `vid-${Date.now()}`, type, url: '' };
        else if (type === 'youtube') newBlock = { id: `yt-${Date.now()}`, type, url: '' };
        else if (type === 'html') newBlock = { id: `html-${Date.now()}`, type, content: '' };
        else newBlock = { id: `${type}-${Date.now()}`, type, content: '' };
        setBlocks(prev => [...prev, newBlock]);
    };
    
    const updateBlock = (id: string, value: string) => {
        setBlocks(prev => prev.map(b => {
            if (b.id === id) {
                if (b.type === 'youtube') return { ...b, url: value };
                return { ...b, content: value };
            }
            return b;
        }) as Block[]);
    };
    
    const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));
    
    // Update fungsi simpan untuk mengirim semua data
    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        const titleToSave = blocks.find(b => b.type === 'heading')?.content || 'Tanpa Judul';
        
        // Jika slug kosong saat menyimpan, buat dari judul
        const slugToSave = slug || generateSlug(titleToSave);

        const payload = {
            title: titleToSave,
            slug: slugToSave,
            featuredImageUrl: featuredImageUrl,
            blocks: blocks,
        };

        try {
            await fetchWithAuth(apiUrl, { method: 'PUT', body: JSON.stringify(payload) });
            alert('Perubahan berhasil disimpan!');
            // Mutate data SWR agar daftar postingan di halaman lain ikut terupdate
            mutate('/api/posts'); 
            router.push('/dashboard/posts');
        } catch (err) { 
            alert('Gagal menyimpan perubahan.'); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(item => item.id === active.id);
            const newIndex = blocks.findIndex(item => item.id === over.id);
            setBlocks(items => arrayMove(items, oldIndex, newIndex));
        }
    };
    
    if (error) return <div className="text-center py-12 text-red-500">Gagal memuat data.</div>;
    if (isLoading) return <div className="text-center py-12">Memuat...</div>;

    return (
        <div className="container py-8 mx-auto">
            {/* Input file tersembunyi */}
            <input type="file" ref={contentFileInputRef} onChange={handleContentFileSelected} className="hidden" />
            <input type="file" ref={featuredImageInputRef} onChange={handleFeaturedImageUpload} accept="image/*" className="hidden" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Konten</h1>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/posts" className="text-sm flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-100"><ArrowLeft size={16} /> Kembali</Link>
                    <button onClick={handleSaveChanges} disabled={isSubmitting} className="flex items-center justify-center gap-2 w-36 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? <Spinner size="sm" /> : 'Simpan'}</button>
                </div>
            </div>
            
            {/* Layout baru dengan Main Content dan Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Utama untuk Editor Blok */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {blocks.map(block => <SortableBlock key={block.id} block={block} onUpdate={updateBlock} onRemove={removeBlock} onInitiateUpload={handleInitiateUpload} isUploading={uploadingBlockId === block.id} />)}
                            </SortableContext>
                        </DndContext>
                    </div>
                    <div className="mt-6 border-t pt-4 flex items-center gap-2">
                        <span className="text-sm font-medium">Tambah Blok:</span>
                        <button onClick={() => addBlock('heading')} className="p-2 border rounded-md hover:bg-slate-100" title="Tambah Judul"><Type size={18} /></button>
                        <button onClick={() => addBlock('paragraph')} className="p-2 border rounded-md hover:bg-slate-100" title="Tambah Paragraf"><Pilcrow size={18} /></button>
                        <button onClick={() => addBlock('image')} className="p-2 border rounded-md hover:bg-slate-100" title="Upload Gambar"><ImageIcon size={18} /></button>
                        <button onClick={() => addBlock('youtube')} className="p-2 border rounded-md hover:bg-slate-100" title="Embed YouTube"><Youtube size={18} /></button>
                        <button onClick={() => addBlock('html')} className="p-2 border rounded-md hover:bg-slate-100" title="Tambah Blok HTML Kustom"><Code2 size={18} /></button>
                    </div>
                </div>

                {/* Sidebar untuk Pengaturan Metadata */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white p-5 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center gap-2"><Settings size={20} /> Pengaturan Postingan</h3>
                        
                        {/* Pengaturan Slug */}
                        <div className="mb-6">
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input 
                                type="text" 
                                id="slug" 
                                value={slug}
                                onChange={handleSlugChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="contoh-slug-url"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ini akan menjadi bagian dari URL. Gunakan huruf kecil, angka, dan tanda hubung (-).</p>
                        </div>

                        {/* Pengaturan Gambar Unggulan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Unggulan</label>
                            <div className="w-full h-40 border-2 border-dashed rounded-md flex justify-center items-center bg-gray-50 relative">
                                {isUploadingFeatured ? (
                                    <Spinner />
                                ) : featuredImageUrl ? (
                                    <Image src={featuredImageUrl.startsWith('http') ? featuredImageUrl : `${process.env.NEXT_PUBLIC_API_URL}${featuredImageUrl}`} alt="Gambar Unggulan" layout="fill" objectFit="cover" className="rounded-md" />
                                ) : (
                                    <p className="text-sm text-gray-500">Belum ada gambar</p>
                                )}
                            </div>
                            <button 
                                onClick={() => featuredImageInputRef.current?.click()} 
                                className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
                                disabled={isUploadingFeatured}
                            >
                                {featuredImageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
