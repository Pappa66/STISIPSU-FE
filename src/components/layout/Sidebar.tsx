"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen,
  GraduationCap,
  Image,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Shield,
  Speaker,
  UploadCloud,
  User,
  UserRound,
  FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ImageNext from "next/image";
import { Menu } from "lucide-react";

const navItems = {
  ADMIN: [
    { href: "/dashboard/users/students", label: "Mahasiswa", icon: UserRound },
    { href: "/dashboard/users/lecturers", label: "Dosen", icon: GraduationCap },
    { href: "/dashboard/users/admins", label: "Admin", icon: Shield },
    { href: "/dashboard/pages", label: "Halaman", icon: FileText },
    { href: "/dashboard/news", label: "Berita", icon: FileText },
    { href: "/dashboard/banners", label: "Banner", icon: Image },
    { href: "/dashboard/gallery", label: "Galeri", icon: Image },
    { href: "/dashboard/announcements", label: "Pengumuman", icon: Speaker },
    { href: "/dashboard/menu", label: "Menu", icon: LayoutDashboard },
    { href: "/dashboard/contact", label: "Kontak", icon: PhoneCall },
    { href: "/dashboard/repository", label: "Repository", icon: BookOpen },
  ],
  MAHASISWA: [
    {
      href: "/dashboard/my-repository",
      label: "Repository Saya",
      icon: UploadCloud,
    },
    { href: "/dashboard/profile", label: "Profil", icon: User },
  ],
  DOSEN: [
    { href: "/dashboard/advising", label: "Bimbingan", icon: GraduationCap },
    { href: "/dashboard/profile", label: "Profil", icon: User },
  ],
};

interface DecodedToken {
  role: "ADMIN" | "MAHASISWA" | "DOSEN";
  name: string;
  email: string;
  userCode: string;
}

export default function Sidebar() {
  const { token, logout } = useAuthStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const decoded = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])) as DecodedToken;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    // Cegah scroll ketika sidebar terbuka di HP
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!decoded) return null;

  const { role, name, email, userCode } = decoded;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center rounded-md bg-sky-600 text-white p-2 shadow-lg focus:outline-none"
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 flex flex-col h-screen max-w-[80vw] w-64 sm:w-72 bg-white shadow-xl border-r transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-sky-600 to-sky-500 text-white">
          <ImageNext
            src="/logo-stisip-1.png"
            width={40}
            height={40}
            alt="Logo"
            className="rounded"
          />
          <span className="text-lg font-bold tracking-wide leading-snug">
            STISIP Syamsul Ulum
          </span>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b bg-sky-50">
          <p className="font-semibold text-sky-700 truncate">{name}</p>
          <p className="text-xs text-gray-600 break-words">{email}</p>
          <p className="text-xs text-gray-500 mt-1">Kode: {userCode}</p>

          {/* Logout */}
          <div className="pt-4">
            <button
              onClick={logout}
              className="
      group relative flex items-center justify-between gap-2
      w-full max-w-[200px]
      px-4 py-2
      bg-white text-black
      border border-black rounded-xl
      shadow-[3px_3px_0px_#000]
      transition-all duration-300 ease-in-out
      hover:shadow-[1px_1px_0px_#000]
      hover:translate-x-[1px] hover:translate-y-[1px]
      active:scale-[0.97]
      overflow-hidden
    "
            >
              {/* Background hover effect */}
              <div
                className="
        absolute inset-0 bg-red-500 z-[-1]
        transform -translate-x-full
        transition-transform duration-300 ease-in-out
        group-hover:translate-x-0
      "
              />

              {/* Text */}
              <span
                className="
        relative text-sm font-semibold
        transition-all duration-300 ease-in-out
        group-hover:text-white
      "
              >
                Logout
              </span>

              {/* Icon */}
              <div
                className="
        relative flex items-center justify-center
        w-7 h-7
        rounded-full border border-black bg-gray-100
        transition-all duration-300 ease-in-out
        group-hover:translate-x-[2px]
        group-hover:bg-red-500
      "
              >
                <LogOut className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-white">
          {navItems[role].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-100 text-sky-700 font-semibold border-l-4 border-sky-600"
                    : "text-gray-600 hover:bg-sky-50"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
