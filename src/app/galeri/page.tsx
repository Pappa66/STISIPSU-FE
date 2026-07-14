import GalleryListClient from "./GalleryListClient";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
}

async function getGalleryData(): Promise<GalleryItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/public/gallery`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Gagal ambil data galeri:", error);
    return [];
  }
}

export default async function GaleriPage() {
  const galleryItems = await getGalleryData();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Galeri Kegiatan
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Momen-momen berharga yang terekam dalam kegiatan kampus STISIP
            Syamsul Ulum.
          </p>
        </div>

        <GalleryListClient galleryItems={galleryItems} />
      </div>
    </div>
  );
}
