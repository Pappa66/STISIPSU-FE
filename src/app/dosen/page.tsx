import { GraduationCap, Search, Mail } from "lucide-react";
import Link from "next/link";

interface Lecturer {
  id: string;
  name: string;
  nidn: string;
  userCode: string;
  email: string;
}

async function getLecturers(): Promise<Lecturer[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    const res = await fetch(`${baseUrl}api/public/lecturers`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DosenPage() {
  const lecturers = await getLecturers();

  return (
    <main className="bg-white min-h-screen">
      <div className="relative bg-sky-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Direktori Dosen</h1>
          <p className="mt-2 text-lg text-white/80">
            Dosen STISIP Syamsul &apos;Ulum Sukabumi
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {lecturers.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Belum ada data dosen.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lecturers.map((dosen) => (
              <div key={dosen.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-7 w-7 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{dosen.name}</h3>
                    <p className="text-xs text-gray-500">{dosen.userCode}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {dosen.nidn !== "-" && (
                    <p><span className="font-medium">NIDN:</span> {dosen.nidn}</p>
                  )}
                  <p className="flex items-center gap-1">
                    <Mail size={14} />
                    <a href={`mailto:${dosen.email}`} className="text-sky-600 hover:underline truncate">
                      {dosen.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
