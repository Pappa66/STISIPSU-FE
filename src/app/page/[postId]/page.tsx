"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Img } from '@/components/common/OptimizedImage';
import { buildImageUrl } from '@/utils/image';

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

interface PostData {
  id: string;
  title: string;
  blocks: Block[] | null;
  createdAt: string;
}

interface NavItem {
  id: string;
  name: string;
  submenus?: {
    id: string;
    name: string;
    href: string;
    type?: string;
    post?: {
      id: string;
      slug: string;
    };
  }[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PublicPostPage() {
  const params = useParams();
  const postId = params.postId as string;

  const { data: post, isLoading } = useSWR<PostData>(
    postId ? `${process.env.NEXT_PUBLIC_API_URL}api/posts/${postId}` : null,
    fetcher
  );

  const { data: nav } = useSWR<NavItem[]>(
    `${process.env.NEXT_PUBLIC_API_URL}api/menu-items`,
    fetcher
  );

  if (isLoading) return <p>Memuat...</p>;
  if (!post) return notFound();

  const currentSlug = `/page/${postId}`;

  // Menentukan parent menu aktif dari slug yang cocok dengan `href`
  const activeParent = nav?.find((parent) =>
    parent.submenus?.some((sub) => {
      if (sub.type === "INTERNAL" && sub.post?.id) {
        return `/page/${sub.post.id}` === currentSlug;
      }
      return sub.href === currentSlug;
    })
  );

  return (
    <main className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {/* KONTEN */}
      <article className="md:col-span-2 space-y-6">
        {post.blocks?.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </article>

      {/* SIDEBAR */}
      <aside className="bg-sky-700 p-6 rounded-lg text-white">
        <h3 className="text-3xl font-bold mb-4 border-b-2 border-white pb-2">
          {activeParent?.name || "Menu"}
        </h3>

        {activeParent?.submenus?.map((sub) => {
          let linkHref = "#";
          if (sub.type === "INTERNAL" && sub.post?.id) {
            linkHref = `/page/${sub.post.id}`;
          } else if (sub.href) {
            linkHref = sub.href;
          }

          return (
            <Link
              key={sub.id}
              href={linkHref}
              className={`block text-md mb-2 hover:underline ${
                linkHref === currentSlug ? "font-bold underline" : ""
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </aside>
    </main>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h1 className="text-3xl font-bold  text-center text-sky-700 my-6">
          {block.content}
        </h1>
      );

    case "paragraph":
    case "table":
    case "list":
    case "tasklist":
    case "bulletList":
    case "orderedList":
      return (
        <div
          className="prose max-w-none text-gray-800 leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "html":
      return (
        <div
          className="prose max-w-none text-gray-800 leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "image":
      return (
        <figure className="my-6">
          <Img
            src={block.url}
            alt="Konten Gambar"
            className="w-full rounded-lg shadow-md"
          />
        </figure>
      );

    case "video":
      return (
        <video
          src={buildImageUrl(block.url)}
          controls
          className="w-full my-6 rounded-lg shadow-md"
        ></video>
      );

    case "youtube":
      const videoId =
        block.url.split("v=")[1]?.split("&")[0] || block.url.split("/").pop();
      if (!videoId) return null;
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allowFullScreen
          className="w-full aspect-video my-6 rounded-lg shadow-md"
        ></iframe>
      );

    default:
      return null;
  }
}
