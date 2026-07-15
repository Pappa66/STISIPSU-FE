import BeritaListClient from "./BeritaListClient";

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
      { next: { revalidate: 60 } }
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
  return <BeritaListClient news={allNews} />;
}
