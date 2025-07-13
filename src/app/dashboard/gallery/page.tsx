'use client';

// --- PERBAIKAN: Tambahkan 'useRef' dan 'ChangeEvent' dari React ---
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import { ImageUp, Trash2, GripVertical, Save, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Impor yang diperlukan untuk dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Tipe data untuk item gambar galeri
interface GalleryImage {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    order: number;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data galeri');
    return res.json();
});

// Komponen terpisah untuk setiap kartu gambar (sekarang dengan logika sortable)
function SortableImageCard({ image, mutateList }: { image: GalleryImage, mutateList: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [title, setTitle] = useState(image.title);
    const [description, setDescription] = useState(image.description || '');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleUpdate = () => {
        setIsSaving(true);
        // Optimistic update
        const originalData = { title, description };
        const promise = fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/gallery/${image.id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description }),
        }).catch(err => {
            // Revert on error
            setTitle(originalData.title);
            setDescription(originalData.description);
            throw err;
        }).finally(() => {
            setIsSaving(false);
        });

        toast.promise(promise, {
            loading: 'Menyimpan...',
            success: 'Info gambar diperbarui!',
            error: 'Gagal menyimpan.',
        });
    };
    
    // Debounce: Simpan otomatis setelah user berhenti mengetik
    const onInputChange = (handler: Function, value: string) => {
        handler(value);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            handleUpdate();
        }, 1000); // Simpan setelah 1 detik tidak ada perubahan
    };

    const handleDelete = async () => {
        if (!window.confirm(`Yakin ingin menghapus gambar "${image.title}"?`)) return;
        
        setIsDeleting(true);
        const promise = fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/gallery/${image.id}`, {
            method: 'DELETE',
        });

        toast.promise(promise, {
            loading: 'Menghapus...',
            success: 'Gambar berhasil dihapus!',
            error: 'Gagal menghapus.',
        });

        try {
            await promise;
            mutateList();
        } catch (e) {
            setIsDeleting(false);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
            <div className="relative">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}${image.imageUrl}`} alt={title} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleDelete} disabled={isDeleting} className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 disabled:bg-gray-400">
                        {isDeleting ? <Spinner size="sm" /> : <Trash2 size={16} />}
                    </button>
                    <div {...attributes} {...listeners} className="p-2 bg-gray-700 text-white rounded-full shadow-lg cursor-grab">
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <input type="text" value={title} onChange={(e) => onInputChange(setTitle, e.target.value)} placeholder="Judul Gambar" className="font-semibold text-lg border-b-2 mb-2 p-1 w-full focus:outline-none focus:border-blue-500" />
                <textarea value={description} onChange={(e) => onInputChange(setDescription, e.target.value)} placeholder="Deskripsi singkat (opsional)" className="text-sm text-gray-600 border-b p-1 w-full flex-grow focus:outline-none focus:border-blue-500" rows={2}></textarea>
            </div>
        </div>
    );
}


export default function GalleryManagementPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/gallery`;
    const { data: images = [], error, isLoading, mutate } = useSWR<GalleryImage[]>(apiUrl, fetcher);

    const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        setGalleryItems(images);
    }, [images]);
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setGalleryItems((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        const itemsToSave = galleryItems.map(({ id }, index) => ({ id, order: index }));
        
        const promise = fetchWithAuth(`${apiUrl}/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ items: itemsToSave }),
        });

        toast.promise(promise, {
            loading: 'Menyimpan urutan...',
            success: 'Urutan galeri berhasil diperbarui!',
            error: 'Gagal menyimpan urutan.',
        });

        try {
            await promise;
            mutate();
        } catch (e) { /* Error dihandle toast */ } 
        finally { setIsSavingOrder(false); }
    };

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('galleryImages', files[i]);
        
        const promise = fetchWithAuth(`${apiUrl}/upload`, { method: 'POST', body: formData });
        toast.promise(promise, {
            loading: 'Mengunggah gambar...',
            success: 'Gambar berhasil diunggah!',
            error: 'Gagal mengunggah gambar.',
        });

        try {
            await promise;
            mutate();
        } catch (e) { /* Error dihandle toast */ }
        finally { event.target.value = '' }
    };

    if (error) return <div className="container py-8 text-center text-red-500">Gagal memuat data galeri.</div>;

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="container py-8 mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Kelola Galeri</h1>
                        <p className="text-gray-500 mt-1">Unggah, atur, dan beri keterangan pada foto kegiatan.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSaveOrder} disabled={isSavingOrder} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                            {isSavingOrder ? <Spinner size="sm" /> : <><Save size={16} /> Simpan Urutan</>}
                        </button>
                        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 cursor-pointer">
                            <ImageUp size={16} />
                            <span>Unggah Gambar</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                {isLoading ? (
                     <div className="text-center p-16"><Spinner size="lg" /></div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={galleryItems.map(item => item.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {galleryItems.length > 0 ? galleryItems.map(item => (
                                    <SortableImageCard key={item.id} image={item} mutateList={mutate} />
                                )) : (
                                    <div className="col-span-full flex flex-col items-center justify-center text-center p-16 bg-gray-50 rounded-lg border-2 border-dashed">
                                        <ImageIcon size={64} className="text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700">Galeri Masih Kosong</h3>
                                        <p className="text-gray-500 mt-2">Klik tombol "Unggah Gambar" untuk menambahkan foto pertama Anda.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </>
    );
}
