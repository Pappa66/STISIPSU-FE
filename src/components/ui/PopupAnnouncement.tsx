'use client';

import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react'; // Pastikan kamu pakai lucide-react atau ganti icon
import { X } from 'lucide-react'; // pastikan lucide-react sudah di-install
import OptimizedImage from '@/components/common/OptimizedImage';


interface Announcement {
  id: string;
  type: 'TEXT' | 'IMAGE';
  content?: string | null;
  imageUrl?: string | null;
}

export default function PopupAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}api/public/announcements`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setAnnouncement(data);
          setShow(true);
        }
      })
      .catch(() => {});

    return () => clearTimeout(timeout);
  }, []);

  if (!show || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative animate-scaleIn">
        <button
  onClick={() => setShow(false)}
  className="
    absolute top-3 right-3
    rounded-full p-1.5
    bg-gray-100 hover:bg-red-500
    text-gray-500 hover:text-white
    shadow hover:shadow-md
    transition-all duration-300 ease-in-out
    hover:rotate-90
  "
  aria-label="Tutup pengumuman"
>
  <X className="w-5 h-5" />
</button>
        {announcement.type === 'TEXT' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Megaphone className="h-10 w-10 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Pengumuman</h2>
            <p className="text-gray-700 text-base whitespace-pre-line leading-relaxed">{announcement.content}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 text-center">Pengumuman</h2>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <OptimizedImage
                src={announcement.imageUrl}
                alt="Pengumuman"
                fill
              />
              <div className="absolute inset-0 bg-black/15" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
