"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  BookCopy,
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
  Link2,
  Newspaper,
  PanelLeftClose,
  PanelRightOpen,
  Camera,
  Megaphone,
  MenuIcon,
  Notebook,
  HelpCircle,
  UserCog,
  Users,
  Database,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ImageNext from "next/image";
import { Menu } from "lucide-react";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: any }[];
}

const navGroups: Record<string, NavGroup[]> = {
  ADMIN: [
    {
      label: "Manajemen Pengguna",
      items: [
        { href: "/dashboard/users/students", label: "Mahasiswa", icon: Users },
        { href: "/dashboard/users/lecturers", label: "Dosen", icon: GraduationCap },
        { href: "/dashboard/users/admins", label: "Admin", icon: UserCog },
      ],
    },
    {
      label: "Manajemen Konten",
      items: [
        { href: "/dashboard/pages", label: "Halaman", icon: Notebook },
        { href: "/dashboard/news", label: "Berita", icon: Newspaper },
        { href: "/dashboard/banners", label: "Banner", icon: Image },
        { href: "/dashboard/gallery", label: "Galeri", icon: Camera },
        { href: "/dashboard/announcements", label: "Pengumuman", icon: Megaphone },
      ],
    },
    {
      label: "Navigasi & Tautan",
      items: [
        { href: "/dashboard/menu", label: "Menu", icon: MenuIcon },
        { href: "/dashboard/footer", label: "Footer", icon: Link2 },
        { href: "/dashboard/contact", label: "Kontak", icon: PhoneCall },
      ],
    },
    {
      label: "Fitur Utama",
      items: [
        { href: "/dashboard/repository", label: "Repository", icon: BookOpen },
      ],
    },
    {
      label: "Sistem",
      items: [
        { href: "/dashboard/backup", label: "Backup", icon: Database },
      ],
    },
    {
      label: "Bantuan",
      items: [
        { href: "/dashboard/panduan", label: "Panduan", icon: BookCopy },
      ],
    },
  ],
  MAHASISWA: [
    {
      label: "Fitur Utama",
      items: [
        { href: "/dashboard/my-repository", label: "Repository Saya", icon: UploadCloud },
        { href: "/dashboard/profile", label: "Profil", icon: User },
      ],
    },
  ],
  DOSEN: [
    {
      label: "Fitur Utama",
      items: [
        { href: "/dashboard/advising", label: "Bimbingan", icon: GraduationCap },
        { href: "/dashboard/profile", label: "Profil", icon: User },
      ],
    },
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

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
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

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center rounded-md bg-sky-600 text-white p-2 shadow-lg focus:outline-none"
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex fixed top-4 z-50 items-center justify-center rounded-md bg-white text-gray-500 p-1.5 shadow border hover:bg-gray-50 transition-all"
        style={{ left: collapsed ? "4.25rem" : "17rem" }}
        aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <PanelRightOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 flex flex-col h-screen bg-white shadow-xl border-r transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "max-w-[80vw] w-64 sm:w-72",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={clsx(
          "flex items-center border-b bg-gradient-to-r from-sky-600 to-sky-500 text-white",
          collapsed ? "justify-center p-3" : "gap-3 p-5"
        )}>
          <ImageNext
            src="/logo-stisip-1.png"
            width={collapsed ? 28 : 40}
            height={collapsed ? 28 : 40}
            alt="Logo"
            className="rounded shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-bold tracking-wide leading-snug">
              STISIP
            </span>
          )}
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b bg-sky-50">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sky-700 truncate text-sm">{name}</p>
              <NotificationBell />
            </div>
            <p className="text-xs text-gray-500 truncate">{email}</p>
            <p className="text-xs text-gray-400">Kode: {userCode}</p>
            <button
              onClick={logout}
              className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}

        {/* Nav Menu */}
        <nav className={clsx(
          "flex-1 overflow-y-scroll bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
          collapsed ? "px-2 py-4 space-y-2" : "px-3 py-4 space-y-4"
        )}>
          {(navGroups[role] || []).map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {group.label}
                </p>
              )}
              <div className={collapsed ? "space-y-1" : "space-y-0.5"}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  const linkContent = (
                    <>
                      <Icon className={clsx("shrink-0", collapsed ? "h-5 w-5" : "h-4.5 w-4.5", isActive ? "text-sky-600" : "text-gray-400")} />
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  );
                  return collapsed ? (
                    <div
                      key={item.href}
                      onClick={() => { setIsOpen(false); window.location.href = item.href; }}
                      className={clsx(
                        "flex items-center justify-center p-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                        isActive
                          ? "bg-sky-50 text-sky-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-sky-600"
                      )}
                      title={item.label}
                    >
                      {linkContent}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-sky-50 to-white text-sky-700 shadow-sm border-l-[3px] border-sky-600 ml-0"
                          : "text-gray-600 hover:bg-sky-50 hover:text-sky-600 border-l-[3px] border-transparent ml-0"
                      )}
                    >
                      {linkContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapsed Notif + Logout */}
        {collapsed && (
          <div className="border-t p-2 space-y-1">
            <div className="flex justify-center">
              <NotificationBell />
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center w-full p-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Spacer for main content when sidebar is expanded on desktop */}
      {!collapsed && <div className="hidden md:block w-64 sm:w-72 shrink-0 transition-all duration-300" />}
    </>
  );
}
