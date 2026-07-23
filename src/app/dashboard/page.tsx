"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import useSWR from "swr";
import {
  BookCopy, FileText, GraduationCap, Upload, Activity,
} from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface DecodedToken {
  userId: string;
  role: "ADMIN" | "MAHASISWA" | "DOSEN";
  name: string;
  userCode: string;
  exp: number;
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

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border p-4 shadow-sm">
      <Icon className={`h-8 w-8 ${color}`} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { token, logout } = useAuthStore();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userId, setUserId] = useState("");

  const { data: stats } = useSWR<Stats>(
    userRole === "ADMIN" ? `${process.env.NEXT_PUBLIC_API_URL}api/dashboard/stats` : null,
    (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
  );

  const { data: myRepo } = useSWR(
    userRole === "MAHASISWA" ? `${process.env.NEXT_PUBLIC_API_URL}api/my-repository?userId=${userId}` : null,
    (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
  );

  const { data: myStudents } = useSWR(
    userRole === "DOSEN" ? `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students` : null,
    (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
  );

  const { data: activityLogs } = useSWR(
    userRole ? `${process.env.NEXT_PUBLIC_API_URL}api/activity-logs?limit=5` : null,
    (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json())
  );

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) { logout(); router.replace("/login"); return; }
      setUserRole(decoded.role);
      setUserName(decoded.name);
      setUserCode(decoded.userCode);
      setUserId(decoded.userId);
    } catch { logout(); router.replace("/login"); }
  }, [token, router, logout]);

  if (!userRole) return <div className="text-center py-20">Memuat dasbor...</div>;

  const maxCount = stats?.submissionsByMonth?.length
    ? Math.max(...stats.submissionsByMonth.map((s) => s.count), 1) : 1;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {userName}!</h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-600">
              <p className="text-md">
                Login sebagai: <span className="font-semibold text-indigo-600">{userRole}</span>
              </p>
              <span className="hidden sm:block">|</span>
              <p className="text-md">
                Kode: <span className="font-semibold text-teal-600">{userCode}</span>
              </p>
            </div>
          </div>

          {/* ADMIN — Google OAuth reminder */}
          {userRole === "ADMIN" && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="text-amber-600 font-bold text-lg leading-none mt-0.5">!</div>
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Google OAuth belum dikonfigurasi</p>
                <p className="text-amber-700 mt-1">
                  Atur <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_ID</code> di <code className="bg-amber-100 px-1 rounded">.env</code> backend dan <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> di frontend untuk mengaktifkan login dengan Google. Lihat <code className="bg-amber-100 px-1 rounded">.env.example</code> untuk panduan.
                </p>
              </div>
            </div>
          )}

          {/* ADMIN — full stats */}
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
                {!stats.recentItems || stats.recentItems.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400">Belum ada aktivitas.</p>
                ) : (
                  stats.recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.uploader?.name || "Sistem"} &middot; {new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
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

          {/* MAHASISWA — mini stats */}
          {userRole === "MAHASISWA" && myRepo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniStat icon={Upload} label="Repository Saya" value={myRepo.length || 0} color="text-sky-600" />
              <MiniStat icon={FileText} label="Disetujui" value={myRepo.filter((r: any) => r.approvalStatus === "APPROVED").length || 0} color="text-green-600" />
            </div>
          )}

          {/* DOSEN — mini stats */}
          {userRole === "DOSEN" && myStudents?.students && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniStat icon={GraduationCap} label="Mahasiswa Bimbingan" value={myStudents.students.length || 0} color="text-indigo-600" />
              <MiniStat icon={BookCopy} label="Perlu Review" value={myStudents.students.filter((s: any) => s.pendingItemsCount > 0).length || 0} color="text-amber-600" />
            </div>
          )}

          {/* AKTIVITAS TERBARU — all roles */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity size={18} /> Aktivitas Terbaru
            </h3>
            <div className="bg-gray-50 rounded-xl border divide-y">
              {!activityLogs ? (
                <p className="p-4 text-sm text-gray-400">Memuat...</p>
              ) : activityLogs.logs?.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">Belum ada aktivitas.</p>
              ) : (
                activityLogs.logs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        <span className="text-xs font-semibold text-gray-500 uppercase mr-2">{log.action}</span>
                        {log.entity}
                        {log.details?.title && <span className="text-gray-600"> — {log.details.title}</span>}
                        {log.details?.name && <span className="text-gray-600"> — {log.details.name}</span>}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
