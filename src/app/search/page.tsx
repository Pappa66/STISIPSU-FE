'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Book, FileText, Image as ImageIcon } from 'lucide-react';

interface PostResult {
  id: string;
  title: string;
  slug: string | null;
  type: string;
}
interface RepoResult {
  id: string;
  title: string;
  author: string;
  year: number;
}
interface GalleryResult {
  id: string;
  title: string;
  imageUrl: string;
}

interface SearchResults {
  posts: PostResult[];
  repositories: RepoResult[];
  galleries: GalleryResult[];
}

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      fetch(`/api/public-search?q=${encodeURIComponent(query)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Gagal mengambil data pencarian');
          }
          return res.json();
        })
        .then(data => {
          setResults(data);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return <div className="text-center py-10">Mencari...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!query) {
     return <div className="text-center py-10">Silakan masukkan kata kunci untuk memulai pencarian.</div>;
  }
  
  const noResults = !results || (results.posts.length === 0 && results.repositories.length === 0 && results.galleries.length === 0);

  if (noResults) {
    return <div className="text-center py-10">Tidak ada hasil ditemukan untuk &quot;{query}&quot;.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Hasil Pencarian untuk: <span className="text-blue-700">&quot;{query}&quot;</span>
      </h1>

      <div className="space-y-8">
        {/* HASIL BERITA & HALAMAN (Sudah Benar) */}
        {results && results.posts.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-3"><FileText /> Berita & Halaman</h2>
            <div className="space-y-4">
              {results.posts.map(post => (
                <Link key={post.id} href={`/${post.type === 'NEWS' ? 'berita' : 'halaman'}/${post.slug}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-bold text-blue-800">{post.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* HASIL REPOSITORY (Sudah Benar) */}
        {results && results.repositories.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-3"><Book /> Karya Ilmiah & Repository</h2>
            <div className="space-y-4">
              {results.repositories.map(repo => (
                <Link key={repo.id} href={`/repository/${repo.id}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-bold text-blue-800">{repo.title}</h3>
                  <p className="text-sm text-gray-600">{repo.author} - {repo.year}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* HASIL GALERI (Sudah Diperbaiki) */}
        {results && results.galleries.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4 flex items-center gap-3"><ImageIcon /> Galeri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.galleries.map(gallery => (
                <Link key={gallery.id} href="/galeri" className="block border rounded-lg hover:shadow-lg transition-shadow overflow-hidden group">
                   <div className="w-full h-32 bg-gray-200">
                     <img 
                        src={gallery.imageUrl?.startsWith('http') ? gallery.imageUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}/${gallery.imageUrl.replace(/^\//, '')}`} 
                       alt={gallery.title} 
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="p-2">
                      <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700">{gallery.title}</h3>
                   </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Memuat halaman pencarian...</div>}>
            <SearchPageComponent />
        </Suspense>
    );
}