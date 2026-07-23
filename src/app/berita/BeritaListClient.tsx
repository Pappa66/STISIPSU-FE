"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import Pagination from "@/components/ui/Pagination";
import AnimatedSection from "@/components/common/AnimatedSection";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  featuredImageUrl: string | null;
  author: { name: string };
  createdAt: string;
}

const ITEMS_PER_PAGE = 9;

export default function BeritaListClient({ news }: { news: NewsItem[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (news.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Belum Ada Berita</h1>
        <p className="text-gray-600 mt-2">
          Saat ini belum ada berita atau artikel yang dipublikasikan.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedNews = news.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Portal Berita Kampus
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Informasi dan berita terkini seputar STISIP Syamsul Ulum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedNews.map((article, index) => (
            <AnimatedSection key={article.id} direction="up" delay={index * 0.05} className="h-full">
            <Link
              href={`/berita/${article.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col"
            >
              <OptimizedImage
                src={article.featuredImageUrl || "https://placehold.co/600x400?text=Berita"}
                alt={article.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover shrink-0"
              />
              <div className="p-6 flex flex-col flex-1">
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            </AnimatedSection>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
