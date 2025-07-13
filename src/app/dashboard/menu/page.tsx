
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link'; // <-- Pastikan Link diimpor
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/utils/api';
import { NavItem, SubMenuItem } from '@/types';

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json());

function ItemOverlay({ item }: { item: NavItem | SubMenuItem }) {
    // ... (kode komponen ini tidak berubah)
    const isSubmenu = 'menuItemId' in item;
    const itemClass = isSubmenu ? "flex items-center text-sm py-2 px-3 bg-white rounded-md shadow-lg" : "flex items-center font-semibold bg-white p-4 border rounded-lg shadow-lg";
    return (
        <div className={itemClass}>
            <GripVertical size={16} className="text-slate-500 mr-3" />
            <span className={isSubmenu ? "text-slate-700" : "text-lg text-slate-800"}>{item.name}</span>
        </div>
    );
}

// --- PERBAIKAN PADA KOMPONEN INI ---
function SortableItem({ id, item, isSubmenu, onDelete }: {
    id: string;
    item: NavItem | SubMenuItem;
    isSubmenu: boolean;
    onDelete: (id: string, isSubmenu: boolean) => void;
    // Prop 'onEdit' dihapus
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const itemClass = isSubmenu ? "bg-slate-100 rounded-md" : "bg-white border rounded-lg";

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={`flex items-center justify-between w-full p-2 ${itemClass}`}>
            <div className="flex items-center flex-grow gap-3">
                <button {...listeners} className="cursor-grab p-2 text-slate-500 hover:bg-slate-200 rounded-full"><GripVertical size={16} /></button>
                <span className={isSubmenu ? 'text-sm' : 'text-lg font-semibold'}>{isSubmenu ? `- ${item.name}` : item.name}</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
                {/* Tombol Edit sekarang menjadi Link */}
                <Link href={`/dashboard/menu/edit/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit">
                    <Edit size={16} />
                </Link>
                <button onClick={() => onDelete(item.id, isSubmenu)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Hapus">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// === Komponen Halaman Utama ===
export default function MenuManagementPage() {
    const { refreshMenus } = useAuthStore();
    // Menggunakan path absolut untuk apiUrl
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/menu-items`;

    const { data: menuItems, error, isLoading, mutate } = useSWR<NavItem[]>(apiUrl, fetcher);
    
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const itemsById = useMemo(() => {
        const map = new Map<string, NavItem | SubMenuItem>();
        menuItems?.forEach(item => {
            map.set(item.id, item);
            item.submenus.forEach(sub => map.set(sub.id, sub));
        });
        return map;
    }, [menuItems]);

    const activeItem = activeId ? itemsById.get(String(activeId)) : null;

    // Fungsi handleEdit yang lama dihapus karena tidak lagi digunakan
    const handleCreateMenu = async (isSubmenu: boolean, parentId?: string) => {
        const name = window.prompt(`Nama untuk ${isSubmenu ? 'Sub Menu' : 'Menu Utama'} baru:`);
        if (!name?.trim()) return;
        // Menggunakan path absolut untuk URL API
        const url = `${process.env.NEXT_PUBLIC_API_URL}api/${isSubmenu ? 'submenus' : 'menu-items'}`;
        const body: any = { name: name.trim() };
        if (isSubmenu && parentId) body.menuItemId = parentId;
        try {
            console.log('Attempting to create menu/submenu with URL:', url, 'and body:', body);
            await fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) });
            mutate();
            refreshMenus();
        } catch (err: any) { 
            console.error('Error creating menu/submenu:', err);
            alert(err.message);
        }
    };
    const handleDelete = async (id: string, isSubmenu: boolean) => {
        if (!window.confirm(`Yakin ingin menghapus item ini?`)) return;
        // Menggunakan path absolut untuk URL API
        const url = `${process.env.NEXT_PUBLIC_API_URL}api/${isSubmenu ? 'submenus' : 'menu-items'}/${id}`;
        try {
            console.log('Attempting to delete menu/submenu with URL:', url);
            await fetchWithAuth(url, { method: 'DELETE', body: JSON.stringify({ id }) });
            mutate();
            refreshMenus();
        } catch (err: any) { 
            console.error('Error deleting menu/submenu:', err);
            alert(err.message);
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    async function handleDragEnd(event: DragEndEvent) {
        // ... (logika handleDragEnd tidak berubah)
        const { active, over } = event;
        setActiveId(null);
        if (!menuItems || !over || active.id === over.id) return;
        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);
        const isActiveAMainItem = menuItems.some(item => item.id === activeIdStr);
        const isOverAMainItem = menuItems.some(item => item.id === overIdStr);
        if (isActiveAMainItem && isOverAMainItem) {
            const oldIndex = menuItems.findIndex(item => item.id === activeIdStr);
            const newIndex = menuItems.findIndex(item => item.id === overIdStr);
            if (oldIndex === -1 || newIndex === -1) return;
            const reordered = arrayMove(menuItems, oldIndex, newIndex);
            mutate(reordered, false);
            const apiData = reordered.map((item, index) => ({ id: item.id, order: index }));
            try {
                console.log('Attempting to reorder menu items with URL:', `${process.env.NEXT_PUBLIC_API_URL}api/menu-items/reorder`, 'and body:', apiData);
                await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/menu-items/reorder`, {
                    method: 'PUT', body: JSON.stringify({ items: apiData }),
                }).then(() => refreshMenus()).catch(() => mutate());
            } catch (err: any) {
                console.error('Error reordering menu items:', err);
                alert(err.message);
            }
        } else if (!isActiveAMainItem && !isOverAMainItem) {
            let parentMenu: NavItem | undefined;
            for (const menu of menuItems) {
                if (menu.submenus.some(sub => sub.id === activeIdStr)) {
                    parentMenu = menu;
                    break;
                }
            }
            if (parentMenu) {
                const oldIndex = parentMenu.submenus.findIndex(sub => sub.id === activeIdStr);
                const newIndex = parentMenu.submenus.findIndex(sub => sub.id === overIdStr);
                if (oldIndex === -1 || newIndex === -1) return;
                const reorderedSubmenus = arrayMove(parentMenu.submenus, oldIndex, newIndex);
                const newMenuItems = menuItems.map(menu => 
                    menu.id === parentMenu!.id ? { ...menu, submenus: reorderedSubmenus } : menu
                );
                mutate(newMenuItems, false);
                const apiData = reorderedSubmenus.map((item, index) => ({ id: item.id, order: index }));
                try {
                    console.log('Attempting to reorder submenus with URL:', `${process.env.NEXT_PUBLIC_API_URL}api/submenus/reorder`, 'and body:', apiData);
                    await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/submenus/reorder`, {
                        method: 'PUT', body: JSON.stringify({ items: apiData }),
                    }).then(() => refreshMenus()).catch(() => mutate());
                } catch (err: any) {
                    console.error('Error reordering submenus:', err);
                    alert(err.message);
                }
            }
        }
    }

    if (error) return <div className="container mx-auto py-8 text-center text-red-500">Gagal memuat data menu.</div>;
    if (isLoading) return <div className="container mx-auto py-8 text-center">Memuat data menu...</div>;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manajemen Menu</h1>
                <button onClick={() => handleCreateMenu(false)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Tambah Menu Utama
                </button>
            </div>
            <DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)} collisionDetection={closestCenter}>
                <div className="space-y-6">
                    <SortableContext items={menuItems?.map(item => item.id) || []} strategy={verticalListSortingStrategy}>
                        {menuItems?.map(item => (
                            <div key={item.id} className="p-4 border rounded-xl bg-slate-50">
                                <SortableItem id={item.id} item={item} isSubmenu={false} onDelete={handleDelete}/>
                                <div className="pl-12 mt-3 space-y-2">
                                    <SortableContext items={item.submenus.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                        {item.submenus.map(submenu => (
                                           <SortableItem key={submenu.id} id={submenu.id} item={submenu} isSubmenu={true} onDelete={handleDelete}/>
                                        ))}
                                    </SortableContext>
                                    <button onClick={() => handleCreateMenu(true, item.id)} className="text-sm text-primary hover:underline flex items-center gap-1 pt-2">
                                        <Plus size={14} /> Tambah Sub Menu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </SortableContext>
                </div>
                <DragOverlay>{activeItem ? <ItemOverlay item={activeItem} /> : null}</DragOverlay>
            </DndContext>
        </div>
    );
}


