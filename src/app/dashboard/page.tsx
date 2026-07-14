"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, ElementType } from "react";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import useSWR from "swr";
import {
  Users, BookCopy, Newspaper, UserCircle, ShieldCheck, FileText,
  GalleryVertical, Phone, Megaphone, Upload, Image as ImageIcon, Briefcase,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface DecodedToken {
  userId: string;
  role: "ADMIN" | "MAHASISWA" | "DOSEN";
  name: string;
  userCode: string;
  exp: number;
}

interface DashboardCardProps {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  colorClass: string;
}

interface Stats {
  users: { total: number; admins: number; lecturers: number; students: number };
  content: { totalPosts: number; news: number; publishedNews: number; pages: number };
  repository: { total: number; approved: number; pending: number; rejected: number };
  gallery: number;
  banners: number;
  submissionsByMonth: { month: string; count: number }[];
  recentItems: { id: string; title: string; approvalStatus: string; createdAt: string; uploader: { name: string } }[];
}

const fetcher = (url: string) => fetch(url, {
  headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
}).then((r) => r.json());

const DashboardCard = ({ href, icon: Icon, title, description, colorClass }: DashboardCardProps) => (
  <Link href={href}
    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border shadow hover:shadow-lg hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
    <Icon className={`h-12 w-12 ${colorClass} mb-4`} />
    <h2 className="text-lg font-semibold text-gray-800 text-center">{title}</h2>
    <p className="text-sm text-gray-500 mt-1 text-center">{description}</p>
  </Link>
);

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token, logout } = useAuthStore();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userCode, setUserCode] = useState("");

  const { data: stats } = useSWR<Stats>(
    userRole === "ADMIN" ? `${process.env.NEXT_PUBLIC_API_URL}api/dashboard/stats` : null,
    fetcher
  );

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) { logout(); router.replace("/login"); return; }
      setUserRole(decoded.role);
      setUserName(decoded.name);
      setUserCode(decoded.userCode);
    } catch { logout(); router.replace("/login"); }
  }, [token, router, logout]);

  if (!userRole) return <div className="text-center py-20">Memuat dasbor...</div>;

  const maxCount = stats?.submissionsByMonth?.length
    ? Math.max(...stats.submissionsByMonth.map((s) => s.count), 1)
    : 1;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {userName}!</h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-600">
              <p className="text-md">Login sebagai: <span className="font-semibold text-indigo-600">{userRole}</span></p>
              <span className="hidden sm:block">|</span>
              <p className="text-md">Kode: <span className="font-semibold text-teal-600">{userCode}</span></p>
            </div>
          </div>

          {/* STATISTIK — hanya untuk ADMIN */}
          {userRole === "ADMIN" && stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Pengguna" value={stats.users.total} color="text-blue-600" />
                <StatCard label="Berita Terbit" value={stats.content.publishedNews} color="text-orange-600" />
                <StatCard label="Repository" value={stats.repository.total} color="text-green-600" />
                <StatCard label="Galeri" value={stats.gallery} color="text-pink-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-5 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Submission Repository (6 bulan)</h3>
                  {stats.submissionsByMonth.length === 0 ? (
                    <p className="text-sm text-gray-400">Belum ada data.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.submissionsByMonth.map((s) => (
                        <div key={s.month} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20">{s.month}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                          </div>
                          <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border">
                  <h3 className="font-semibold text-gray-700 mb-4">Ringkasan Repository</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disetujui & Publik</span>
                      <span className="text-sm font-bold text-green-600">{stats.repository.approved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.repository.total ? (stats.repository.approved / stats.repository.total) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Menunggu Review</span>
                      <span className="text-sm font-bold text-yellow-600">{stats.repository.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${stats.repository.total ? (stats.repository.pending / stats.repository.total) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ditolak</span>
                      <span className="text-sm font-bold text-red-600">{stats.repository.rejected}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${stats.repository.total ? (stats.repository.rejected / stats.repository.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-700 mb-3">Aktivitas Terbaru</h3>
              <div className="bg-gray-50 rounded-xl border divide-y">
                {stats.recentItems.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400">Belum ada aktivitas.</p>
                ) : (
                  stats.recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.uploader.name} &middot; {new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                        item.approvalStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {item.approvalStatus}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {userRole === "ADMIN" && !stats && <LoadingSpinner />}

          {/* CARDS — shortcut ke modul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {userRole === "ADMIN" && (
              <>
                <DashboardCard href="/dashboard/users/students" icon={Users} title="Kelola Mahasiswa" description="Atur data mahasiswa." colorClass="text-blue-600" />
                <DashboardCard href="/dashboard/users/lecturers" icon={Briefcase} title="Kelola Dosen" description="Atur data dosen." colorClass="text-indigo-600" />
                <DashboardCard href="/dashboard/users/admins" icon={ShieldCheck} title="Kelola Admin" description="Atur administrator." colorClass="text-red-600" />
                <DashboardCard href="/dashboard/pages" icon={FileText} title="Kelola Halaman" description="Edit halaman statis." colorClass="text-cyan-600" />
                <DashboardCard href="/dashboard/news" icon={Newspaper} title="Kelola Berita" description="Publikasikan artikel." colorClass="text-orange-600" />
                <DashboardCard href="/dashboard/banners" icon={ImageIcon} title="Kelola Banner" description="Atur banner slider." colorClass="text-pink-600" />
                <DashboardCard href="/dashboard/gallery" icon={GalleryVertical} title="Kelola Galeri" description="Atur koleksi foto." colorClass="text-pink-600" />
                <DashboardCard href="/dashboard/announcements" icon={Megaphone} title="Kelola Pengumuman" description="Atur pop-up." colorClass="text-amber-600" />
                <DashboardCard href="/dashboard/menu" icon={ImageIcon} title="Kelola Menu" description="Atur navigasi." colorClass="text-purple-600" />
                <DashboardCard href="/dashboard/contact" icon={Phone} title="Kelola Kontak" description="Info kontak kampus." colorClass="text-lime-600" />
                <DashboardCard href="/dashboard/repository" icon={BookCopy} title="Kelola Repository" description="Atur karya ilmiah." colorClass="text-green-600" />
              </>
            )}
            {userRole === "MAHASISWA" && (
              <>
                <DashboardCard href="/dashboard/my-repository" icon={Upload} title="Repository Saya" description="Unggah & kelola karya." colorClass="text-sky-600" />
                <DashboardCard href="/dashboard/profile" icon={UserCircle} title="Profil Saya" description="Lihat info & ganti password." colorClass="text-teal-600" />
              </>
            )}
            {userRole === "DOSEN" && (
              <>
                <DashboardCard href="/dashboard/advising" icon={Briefcase} title="Bimbingan Saya" description="Review karya ilmiah." colorClass="text-indigo-600" />
                <DashboardCard href="/dashboard/profile" icon={UserCircle} title="Profil Saya" description="Lihat info & ganti password." colorClass="text-teal-600" />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
