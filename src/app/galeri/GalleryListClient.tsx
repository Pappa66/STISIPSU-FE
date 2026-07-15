"use client";

import { useState } from "react";
import OptimizedImage from '@/components/common/OptimizedImage';
import AnimatedSection from '@/components/common/AnimatedSection';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
}

interface Props {
  galleryItems: GalleryItem[];
}

const ITEMS_PER_PAGE = 16;

export default function GalleryListClient({ galleryItems }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
  const visibleItems = galleryItems.slice(0, currentPage * ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <>
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleItems.map((item, index) => (
            <AnimatedSection
              key={item.id}
              direction="up"
              delay={index * 0.05}
              className="group block bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-video">
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="rounded-t-md z-10"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 z-0 pointer-events-none" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Galeri Masih Kosong</h2>
          <p className="text-gray-600 mt-2">
            Saat ini belum ada foto yang diunggah ke galeri.
          </p>
        </div>
      )}

      {/* Tombol Lihat Selengkapnya */}
      {currentPage * ITEMS_PER_PAGE < galleryItems.length && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Lihat Selengkapnya
          </button>
        </div>
      )}

      {/* Pagination */}
      {currentPage * ITEMS_PER_PAGE >= galleryItems.length &&
        totalPages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border-blue-600"
                } transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
    </>
  );
}
