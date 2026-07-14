"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Edit, GripVertical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { fetchWithAuth } from "@/utils/api";
import { NavItem, SubMenuItem } from "@/types";
import CreateMenuModal from "@/components/dashboard/CreateMenuModal";
import ConfirmDeleteModal from "@/components/dashboard/ConfirmDeleteModal";
import toast from "react-hot-toast";

// ✅ Fetcher function
const fetcher = (url: string) =>
  fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

// ✅ Drag Preview
function ItemOverlay({ item }: { item: NavItem | SubMenuItem }) {
  const isSub = "menuItemId" in item;
  return (
    <div className="flex items-center bg-white px-4 py-2 rounded shadow">
      <GripVertical className="text-slate-500 mr-2" size={16} />
      <span
        className={isSub ? "text-sm text-slate-700" : "text-base font-semibold"}
      >
        {item.name}
      </span>
    </div>
  );
}

// ✅ Sortable Item Component
function SortableItem({
  id,
  item,
  isSubmenu,
  onDelete,
}: {
  id: string;
  item: NavItem | SubMenuItem;
  isSubmenu: boolean;
  onDelete: (id: string, isSub: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between w-full p-2 ${
        isSubmenu ? "bg-slate-100" : "bg-white border"
      } rounded-lg`}
    >
      <div className="flex items-center flex-grow gap-3">
        <button
          {...listeners}
          className="cursor-grab p-2 text-slate-500 hover:bg-slate-200 rounded-full"
        >
          <GripVertical size={16} />
        </button>
        <span className={isSubmenu ? "text-sm" : "text-lg font-semibold"}>
          {isSubmenu ? `- ${item.name}` : item.name}
        </span>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <Link
          href={`/dashboard/menu/edit/${item.id}`}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
          title="Edit"
        >
          <Edit size={16} />
        </Link>
        <button
          onClick={() => onDelete(item.id, isSubmenu)}
          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ✅ Main Page
export default function MenuManagementPage() {
  const { refreshMenus } = useAuthStore();
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/menu-items`;

  const {
    data: menuItems,
    error,
    isLoading,
    mutate,
  } = useSWR<NavItem[]>(apiUrl, fetcher);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isSubmenu, setIsSubmenu] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    isSubmenu: boolean;
  } | null>(null);

  const itemsById = useMemo(() => {
    const map = new Map<string, NavItem | SubMenuItem>();
    menuItems?.forEach((item) => {
      map.set(item.id, item);
      item.submenus.forEach((sub) => map.set(sub.id, sub));
    });
    return map;
  }, [menuItems]);

  const activeItem = activeId ? itemsById.get(String(activeId)) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleCreateMenu = (submenu: boolean, pid?: string) => {
    setIsSubmenu(submenu);
    setParentId(pid || null);
    setShowCreateModal(true);
  };

  const handleSubmitCreate = async (name: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/${
      isSubmenu ? "submenus" : "menu-items"
    }`;
    const body: any = { name };
    if (isSubmenu && parentId) body.menuItemId = parentId;

    try {
      await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Menu berhasil ditambahkan!", { id: "create-success" });
      mutate();
      refreshMenus();
    } catch {
      toast.error("Gagal menambahkan menu.", { id: "create-error" });
    }
  };

  const triggerDelete = (id: string, isSub: boolean) => {
    setDeleteTarget({ id, isSubmenu: isSub });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { id, isSubmenu } = deleteTarget;
    const url = `${process.env.NEXT_PUBLIC_API_URL}api/${
      isSubmenu ? "submenus" : "menu-items"
    }/${id}`;

    try {
      await fetchWithAuth(url, { method: "DELETE" });
      toast.success("Item berhasil dihapus.", { id: "delete-success" });
      mutate();
      refreshMenus();
    } catch {
      toast.error("Gagal menghapus item.", { id: "delete-error" });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!menuItems || !over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const isActiveMain = menuItems.some((i) => i.id === activeIdStr);
    const isOverMain = menuItems.some((i) => i.id === overIdStr);

    try {
      if (isActiveMain && isOverMain) {
        const oldIdx = menuItems.findIndex((i) => i.id === activeIdStr);
        const newIdx = menuItems.findIndex((i) => i.id === overIdStr);
        const reordered = arrayMove(menuItems, oldIdx, newIdx);
        mutate(reordered, false);
        await fetchWithAuth(`${apiUrl}/reorder`, {
          method: "PUT",
          body: JSON.stringify({
            items: reordered.map((item, index) => ({
              id: item.id,
              order: index,
            })),
          }),
        });
        refreshMenus();
      } else if (!isActiveMain && !isOverMain) {
        const parent = menuItems.find((menu) =>
          menu.submenus.some((sub) => sub.id === activeIdStr)
        );
        if (!parent) return;
        const oldIdx = parent.submenus.findIndex((s) => s.id === activeIdStr);
        const newIdx = parent.submenus.findIndex((s) => s.id === overIdStr);
        const reordered = arrayMove(parent.submenus, oldIdx, newIdx);
        const updated = menuItems.map((menu) =>
          menu.id === parent.id ? { ...menu, submenus: reordered } : menu
        );
        mutate(updated, false);
        await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}api/submenus/reorder`,
          {
            method: "PUT",
            body: JSON.stringify({
              items: reordered.map((item, index) => ({
                id: item.id,
                order: index,
              })),
            }),
          }
        );
        refreshMenus();
      }
    } catch {
      toast.error("Gagal menyimpan urutan.", { id: "reorder-error" });
    }
  };

  if (error)
    return (
      <div className="text-center text-red-500 py-8">Gagal memuat data.</div>
    );
  if (isLoading) return <div className="text-center py-8">Memuat data...</div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manajemen Menu</h1>
            <button
              onClick={() => handleCreateMenu(false)}
              className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded font-semibold hover:bg-sky-700"
            >
              <Plus size={18} /> Tambah Menu Utama
            </button>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
            collisionDetection={closestCenter}
          >
            <div className="space-y-6">
              <SortableContext
                items={menuItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-xl bg-slate-50"
                  >
                    <SortableItem
                      id={item.id}
                      item={item}
                      isSubmenu={false}
                      onDelete={triggerDelete}
                    />
                    <div className="pl-12 mt-3 space-y-2">
                      <SortableContext
                        items={item.submenus.map((sub) => sub.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {item.submenus.map((submenu) => (
                          <SortableItem
                            key={submenu.id}
                            id={submenu.id}
                            item={submenu}
                            isSubmenu
                            onDelete={triggerDelete}
                          />
                        ))}
                      </SortableContext>
                      <button
                        onClick={() => handleCreateMenu(true, item.id)}
                        className="flex items-center gap-2 bg-sky-700 text-white px-3 py-1 rounded font-semibold hover:bg-sky-800"
                      >
                        <Plus size={14} /> Tambah Sub Menu
                      </button>
                    </div>
                  </div>
                ))}
              </SortableContext>
            </div>
            <DragOverlay>
              {activeItem ? <ItemOverlay item={activeItem} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        <CreateMenuModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitCreate}
          isSubmenu={isSubmenu}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      </div>
    </main>
  );
}
