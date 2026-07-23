"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import useSWR, { mutate } from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Image as ImageIcon,
  Pilcrow,
  Type,
  Trash2,
  Youtube,
  UploadCloud,
  VideoIcon,
  Code2,
  Settings,
  Tags as TagsIcon,
  X as XIcon,
} from "lucide-react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TipTapEditor from "@/components/ui/TipTapEditor";

type Block =
  | { id: string; type: "heading"; content: string }
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "html"; content: string }
  | { id: string; type: "image"; url: string }
  | { id: string; type: "video"; url: string }
  | { id: string; type: "youtube"; url: string }
  | { id: string; type: "table"; content: string }
  | { id: string; type: "list"; content: string }
  | { id: string; type: "tasklist"; content: string }
  | { id: string; type: "bulletList"; content: string }
  | { id: string; type: "orderedList"; content: string };

interface PostWithMeta {
  id: string;
  title: string;
  slug: string | null;
  featuredImageUrl: string | null;
  blocks: Block[] | null;
  tags: string[] | null;
  type: "PAGE" | "NEWS";
}

const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json());

function SortableBlock({
  block,
  onUpdate,
  onRemove,
  onInitiateUpload,
  isUploading,
}: {
  block: Block;
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onInitiateUpload: (id: string, type: "image" | "video") => void;
  isUploading: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fullUrl = (path: string) =>
    path.startsWith("http") ? path : new URL(path, baseUrl).href;

  const renderBlock = () => {
    if (isUploading) {
      return (
        <div className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center">
          <LoadingSpinner />
          <p className="text-sm text-slate-500 mt-2">Mengunggah...</p>
        </div>
      );
    }

    switch (block.type) {
      case "heading":
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Tulis Judul..."
            className="text-3xl font-bold w-full focus:outline-none bg-transparent"
          />
        );

      case "paragraph":
      case "html":
      case "table":
      case "list":
      case "tasklist":
      case "bulletList":
      case "orderedList":
        return (
          <div>
            <TipTapEditor
              value={block.content}
              onChange={(newContent) => onUpdate(block.id, newContent)}
            />
            {block.type !== "paragraph" && (
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Blok: {block.type.toUpperCase()}
              </p>
            )}
          </div>
        );

      case "image":
        if (!block.url)
          return (
            <div
              onClick={() => onInitiateUpload(block.id, "image")}
              className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200"
            >
              <UploadCloud size={32} className="text-slate-400" />
              <p className="text-sm text-slate-500 mt-2">
                Klik untuk mengunggah gambar
              </p>
            </div>
          );
        return (
          <div className="relative w-full h-64 bg-slate-200 rounded-md overflow-hidden">
                        <img
              src={fullUrl(block.url)}
              alt="Konten Gambar"
              className="w-full h-64 object-contain bg-slate-200 rounded-md"
            />
          </div>
        );

      case "video":
        if (!block.url)
          return (
            <div
              onClick={() => onInitiateUpload(block.id, "video")}
              className="w-full h-40 bg-slate-100 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-slate-200"
            >
              <UploadCloud size={32} className="text-slate-400" />
              <p className="text-sm text-slate-500 mt-2">
                Klik untuk mengunggah video
              </p>
            </div>
          );
        return (
          <video
            src={fullUrl(block.url)}
            controls
            className="w-full rounded-md"
          />
        );

      case "youtube": {
        const videoId =
          block.url.split("v=")[1]?.split("&")[0] || block.url.split("/").pop();
        if (!videoId) {
          return (
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="Masukkan URL YouTube..."
              className="w-full focus:outline-none bg-transparent"
            />
          );
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
            className="w-full aspect-video rounded-md"
          ></iframe>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-start gap-2 p-3 bg-white border rounded-lg shadow-sm"
    >
      <button
        {...listeners}
        className="cursor-grab p-2 text-slate-400 hover:bg-slate-100 rounded-md mt-1"
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-grow">{renderBlock()}</div>
      <button
        onClick={() => onRemove(block.id)}
        className="p-2 text-red-500 hover:bg-red-100 rounded-md mt-1"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const postId = params.postId as string;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slug, setSlug] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);

  const contentFileInputRef = useRef<HTMLInputElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}`;
  const {
    data: post,
    error,
    isLoading,
  } = useSWR<PostWithMeta>(apiUrl, fetcher);

  useEffect(() => {
    if (post) {
      if (post.blocks && post.blocks.length > 0) setBlocks(post.blocks);
      else
        setBlocks([
          {
            id: `heading-${Date.now()}`,
            type: "heading",
            content: post.title || "Judul Baru",
          },
        ]);
      setSlug(post.slug || "");
      setFeaturedImageUrl(post.featuredImageUrl || null);
      setTags(post.tags || []);
    }
  }, [post]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    const titleToSave =
      blocks.find((b) => b.type === "heading")?.content || "Tanpa Judul";
    const slugToSave = slug || generateSlug(titleToSave);

    const payload = {
      title: titleToSave,
      slug: slugToSave,
      featuredImageUrl,
      blocks,
      tags,
    };

    try {
      await fetchWithAuth(apiUrl, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Perubahan berhasil disimpan!");
      if (returnTo.includes("news")) mutate("/api/news");
      if (returnTo.includes("pages")) mutate("/api/pages");
      router.push(returnTo);
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateUpload = (blockId: string, type: "image" | "video") => {
    setUploadingBlockId(blockId);
    if (contentFileInputRef.current) {
      contentFileInputRef.current.accept =
        type === "image" ? "image/*" : "video/mp4,video/webm";
      contentFileInputRef.current.click();
    }
  };

  const handleContentFileSelected = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingBlockId) return;

    const formData = new FormData();
    formData.append("upload", file);

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setBlocks(
        (prev) =>
          prev.map((b) =>
            b.id === uploadingBlockId ? { ...b, url: data.url } : b
          ) as Block[]
      );
    } catch (err) {
      toast.error("Upload gagal.");
    } finally {
      setUploadingBlockId(null);
      if (contentFileInputRef.current) contentFileInputRef.current.value = "";
    }
  };

  const handleFeaturedImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFeatured(true);
    const formData = new FormData();
    formData.append("upload", file);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}api/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setFeaturedImageUrl(data.url);
    } catch (err) {
      alert("Upload Gambar Unggulan gagal.");
    } finally {
      setIsUploadingFeatured(false);
    }
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value));
  };

  const addBlock = (type: Block["type"]) => {
    let newBlock: Block;
    if (type === "image") newBlock = { id: `img-${Date.now()}`, type, url: "" };
    else if (type === "video")
      newBlock = { id: `vid-${Date.now()}`, type, url: "" };
    else if (type === "youtube")
      newBlock = { id: `yt-${Date.now()}`, type, url: "" };
    else if (type === "html")
      newBlock = { id: `html-${Date.now()}`, type, content: "" };
    else newBlock = { id: `${type}-${Date.now()}`, type, content: "" };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id: string, value: string) => {
    setBlocks(
      (prev) =>
        prev.map((b) => {
          if (b.id === id) {
            if (b.type === "youtube") return { ...b, url: value };
            return { ...b, content: value };
          }
          return b;
        }) as Block[]
    );
  };

  const removeBlock = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((item) => item.id === active.id);
      const newIndex = blocks.findIndex((item) => item.id === over.id);
      setBlocks((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  if (error)
    return (
      <div className="text-center py-12 text-red-500">Gagal memuat data.</div>
    );
  if (isLoading) return <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <input
            type="file"
            ref={contentFileInputRef}
            onChange={handleContentFileSelected}
            className="hidden"
          />
          <input
            type="file"
            ref={featuredImageInputRef}
            onChange={handleFeaturedImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Konten</h1>
            <div className="flex items-center gap-4">
              <Link
                href={returnTo}
                className="text-sm flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-100"
              >
                <ArrowLeft size={16} /> Kembali
              </Link>
              <button
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-36 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? <LoadingSpinner /> : "Simpan"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onUpdate={updateBlock}
                        onRemove={removeBlock}
                        onInitiateUpload={handleInitiateUpload}
                        isUploading={uploadingBlockId === block.id}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Tambah Blok:</span>
                <button
                  onClick={() => addBlock("heading")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Tambah Judul"
                >
                  <Type size={18} />
                </button>
                <button
                  onClick={() => addBlock("paragraph")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Tambah Paragraf"
                >
                  <Pilcrow size={18} />
                </button>
                <button
                  onClick={() => addBlock("image")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Upload Gambar"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  onClick={() => addBlock("video")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Upload Video"
                >
                  <VideoIcon size={18} /> {/* Gunakan icon yg cocok */}
                </button>
                <button
                  onClick={() => addBlock("youtube")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Embed YouTube"
                >
                  <Youtube size={18} />
                </button>
                <button
                  onClick={() => addBlock("html")}
                  className="p-2 border rounded-md hover:bg-slate-100"
                  title="Tambah Blok HTML Kustom"
                >
                  <Code2 size={18} />
                </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Gunakan gambar secukupnya (maks 3). Di halaman detail, semua gambar ditampilkan seragam ukuran 16:9.
                  Untuk galeri foto, gunakan menu <Link href="/dashboard/gallery" className="text-sky-600 underline">Galeri</Link>.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white p-5 border rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold border-b pb-3 mb-4 flex items-center gap-2">
                  <Settings size={20} /> Pengaturan Postingan
                </h3>

                <div className="mb-6">
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="contoh-slug-url"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Unggulan
                  </label>
                  <div className="w-full h-40 border-2 border-dashed rounded-md flex justify-center items-center bg-gray-50 relative">
                    {isUploadingFeatured ? (
                      <LoadingSpinner />
                    ) : featuredImageUrl ? (
                      <Image
                        src={
                          featuredImageUrl.startsWith("http")
                            ? featuredImageUrl
                            : `${process.env.NEXT_PUBLIC_API_URL}${featuredImageUrl}`
                        }
                        alt="Gambar Unggulan"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Belum ada gambar</p>
                    )}
                  </div>
                  <button
                    onClick={() => featuredImageInputRef.current?.click()}
                    className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
                    disabled={isUploadingFeatured}
                  >
                    {featuredImageUrl ? "Ganti Gambar" : "Upload Gambar"}
                  </button>
                </div>

                {post?.type === "NEWS" && (
                  <div className="border-t pt-4">
                    <label
                      htmlFor="tags"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                    >
                      <TagsIcon size={16} /> Tags
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 min-h-[40px]">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Tambah tag..."
                        className="flex-grow bg-transparent focus:outline-none text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tekan Enter atau koma (,) untuk menambah tag.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
