import Link from "next/link";
import Image from "next/image";
import { Calendar, User } from "lucide-react";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  featuredImageUrl: string | null;
  author: { name: string };
  createdAt: string;
}

async function getNewsData(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/public/news`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.news || [];
  } catch (error) {
    console.error("Gagal mengambil data berita:", error);
    return [];
  }
}

export default async function BeritaPage() {
  const allNews = await getNewsData();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  if (allNews.length === 0) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Belum Ada Berita</h1>
        <p className="text-gray-600 mt-2">
          Saat ini belum ada berita atau artikel yang dipublikasikan.
        </p>
      </div>
    );
  }

  const featuredArticle = allNews[0];
  const otherArticles = allNews.slice(1);

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

        {/* Featured Article */}
        <div className="mb-12">
          <Link
            href={`/berita/${featuredArticle.slug}`}
            className="group block"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-gray-50 p-8 rounded-xl shadow-lg">
              <img
                src={
                  featuredArticle.featuredImageUrl
                    ? `${baseUrl}${featuredArticle.featuredImageUrl}`
                    : "https://placehold.co/800x450?text=Berita"
                }
                alt={featuredArticle.title}
                width={800}
                height={450}
                className="w-full h-full object-cover rounded-lg"
              />
              <div>
                <span className="text-sm font-semibold text-blue-600">
                  BERITA UTAMA
                </span>
                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {featuredArticle.title}
                </h2>
                <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{featuredArticle.author.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {new Date(featuredArticle.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Articles */}
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
          Berita Lainnya
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherArticles.map((article) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
             <img
  src={
    article.featuredImageUrl
      ? `${baseUrl}${article.featuredImageUrl}`
      : "https://placehold.co/600x400?text=Berita"
  }
  alt={article.title}
  width={600}
  height={400}
  className="w-full h-48 object-cover"
/>
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {article.title}
                </h4>
                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
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
          ))}
        </div>
      </div>
    </div>
  );
}
