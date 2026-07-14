"use client";

import { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import useSWR from "swr";
import Link from "next/link";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  UserCircle,
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Info,
} from "lucide-react";

// --- Types ---
interface UserProfile {
  name: string;
  email: string;
  userCode: string;
  role: string;
}

// --- Fetcher ---
const fetcher = (url: string, token: string | null) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

// --- Profile Info Box ---
const ProfileInfo = ({ user }: { user: UserProfile }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3 mb-4">
      <UserCircle className="h-8 w-8 text-sky-600" />
      <h2 className="text-xl font-bold text-sky-700">Informasi Profil</h2>
    </div>
    <div>
      <label className="block text-sm text-gray-500">Nama Lengkap</label>
      <p className="mt-1 text-lg font-semibold text-gray-900">{user.name}</p>
    </div>
    <div>
      <label className="block text-sm text-gray-500">Email</label>
      <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p>
    </div>
    <div>
      <label className="block text-sm text-gray-500">Kode Pengguna</label>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {user.userCode}
      </p>
    </div>
    <div className="flex items-start gap-3 text-sm text-sky-700 bg-sky-50 border border-sky-100 p-4 rounded-md mt-6">
      <Info size={20} className="flex-shrink-0 mt-0.5" />
      <span>
        Untuk perubahan nama atau email, silakan hubungi pihak Administrasi.
      </span>
    </div>
  </div>
);

// --- Password Change Form ---
const PasswordForm = ({ token }: { token: string | null }) => {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword !== confirmNewPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    const promise = axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}api/users/change-password`,
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.promise(promise, {
      loading: "Menyimpan perubahan...",
      success: "Password berhasil diubah 🎉",
      error: (err) =>
        err?.response?.data?.message || "Gagal mengganti password.",
    });

    try {
      await promise;
      setTimeout(() => {
        logout();
        router.push("/login?message=Password+berhasil+diubah");
      }, 2500);
    } catch {
      // handled by toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <Lock className="h-8 w-8 text-sky-600" />
        <h2 className="text-xl font-bold text-sky-700">Ganti Password</h2>
      </div>

      {["oldPassword", "newPassword", "confirmNewPassword"].map((field, i) => {
        const isPasswordVisible =
          field === "oldPassword"
            ? showOld
            : field === "newPassword"
            ? showNew
            : showConfirm;
        const setShow =
          field === "oldPassword"
            ? setShowOld
            : field === "newPassword"
            ? setShowNew
            : setShowConfirm;

        const label =
          field === "oldPassword"
            ? "Password Lama"
            : field === "newPassword"
            ? "Password Baru"
            : "Konfirmasi Password Baru";

        return (
          <div key={i} className="relative">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              name={field}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400"
      >
        {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
        {isLoading ? "Mengganti..." : "Ganti Password"}
      </button>
    </form>
  );
};

// --- Main Component ---
export default function ProfilePage() {
  const { token } = useAuthStore();
  const {
    data: user,
    error,
    isLoading,
  } = useSWR<UserProfile>(
    token ? `${process.env.NEXT_PUBLIC_API_URL}api/users/profile` : null,
    (url: string) => fetcher(url, token)
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error)
    return (
      <div className="container py-20 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Gagal Memuat Profil</h2>
        <p>Silakan coba refresh halaman atau hubungi admin.</p>
      </div>
    );

  if (!user)
    return (
      <div className="container py-20 text-center text-gray-500">
        <h2 className="text-xl font-bold mb-2">Data profil tidak ditemukan</h2>
      </div>
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="max-w-screen-xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-sky-700">
                  Pengaturan Profil
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola informasi akun dan keamanan Anda.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg shadow-sm bg-white text-sky-700 hover:bg-sky-50 transition-all"
              >
                <ArrowLeft size={16} /> Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-lg shadow border border-sky-100">
                <ProfileInfo user={user} />
              </div>
              <div className="p-6 bg-white rounded-lg shadow border border-sky-100">
                <PasswordForm token={token} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
