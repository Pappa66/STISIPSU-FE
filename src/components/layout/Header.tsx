"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";
import type { HTMLAttributes } from "react";
import {
  NavItem as NavItemType,
  SubMenuItem as SubMenuItemType,
} from "@/types";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  LogIn,
  ExternalLink,
  Menu,
  X,
  Search,
  ChevronUp,
} from "lucide-react";
import { DynamicIcon } from "@/lib/iconMap";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout, menuVersion } = useAuthStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(
    null
  );

  const [isClient, setIsClient] = useState(false);
  const [navigationData, setNavigationData] = useState<NavItemType[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

useEffect(() => {
  // Tutup menu saat route berubah
  setOpenMenu(null);
  setOpenMobileSubmenu(null);
}, [pathname]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/menu-items`
        );
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setNavigationData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil data menu:", error);
        setNavigationData([]);
      }
    };
    fetchMenuData();
  }, [menuVersion]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMobileSubmenuToggle = (itemId: string) => {
    setOpenMobileSubmenu((prev) => (prev === itemId ? null : itemId));
  };

  const MotionDiv = motion.div as React.ComponentType<
    HTMLAttributes<HTMLDivElement> & MotionProps
  >;

  const renderLink = (
    item: NavItemType | SubMenuItemType,
    isMobile = false
  ) => {
    const isSubmenuItem = "menuItemId" in item;
    const hasSubmenus =
      "submenus" in item && item.submenus && item.submenus.length > 0;

    if (hasSubmenus) {
      const isOpen = openMenu === item.id;

      const commonClasses = clsx(
        "flex items-center gap-2 text-sm font-semibold transition-colors px-4 py-2 rounded-t-md",
        isOpen ? "bg-sky-600 text-white" : "hover:bg-sky-600 hover:text-white"
      );

      if (isMobile) {
        return (
          <button
            onClick={() => handleMobileSubmenuToggle(item.id)}
            className={clsx(commonClasses, "w-full justify-between")}
          >
            <span className="flex items-center gap-2">
              <DynamicIcon name={item.icon} className="w-4 h-4" />
              {item.name}
            </span>
            {openMobileSubmenu === item.id ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        );
      }

      return (
        <button
          onClick={() => setOpenMenu(isOpen ? null : item.id)}
          className={clsx(commonClasses, "cursor-pointer")}
        >
          <span className="flex items-center gap-2">
            <DynamicIcon name={item.icon} className="w-4 h-4" />
            {item.name}
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-white" />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      );
    }

    const commonLinkClasses = isSubmenuItem
      ? `block w-full text-left text-sm rounded-md transition-colors ${
          isMobile ? "pl-8" : ""
        }`
      : `block w-full rounded-md text-left px-4 py-2 text-sm transition-colors hover:bg-sky-600 hover:text-white ${
          isMobile ? "w-full justify-between px-4 py-3" : "h-full"
        }`;

    const isExternalUrl =
      typeof item.href === "string" &&
      (item.href.startsWith("http://") || item.href.startsWith("https://"));

    const nameSpan = (
      <span className="flex items-center gap-2">
        <DynamicIcon name={item.icon} className="w-4 h-4 shrink-0" />
        {item.name}
      </span>
    );

    if (isExternalUrl) {
      return (
        <a
          href={item.href!}
          target="_blank"
          rel="noopener noreferrer"
          className={`${commonLinkClasses} flex items-center justify-between`}
          onClick={() => {
            if (isMobile) setMobileMenuOpen(false);
          }}
        >
          {nameSpan}
          <ExternalLink size={14} className="ml-1 shrink-0" />
        </a>
      );
    }

    let linkHref = "#";
    if (item.type === "INTERNAL" && item.post?.id) {
      linkHref = `/page/${item.post.id}`;
    } else if (typeof item.href === "string") {
      linkHref = item.href;
    }

    return (
      <Link
        href={linkHref}
        className={clsx(commonLinkClasses)}
        onClick={() => {
          if (isMobile) setMobileMenuOpen(false);
        }}
      >
        {nameSpan}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-blue-900 to-sky-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 lg:h-26">
            <Link
              href="/"
              className="flex items-center gap-2 lg:gap-3 flex-shrink-0"
            >
              <Image
                src="/logo-stisip-1.png"
                alt="Logo STISIP"
                width={60}
                height={60}
                className="lg:w-[70px] lg:h-[70px]"
              />
              <span className="hidden sm:inline-block text-base lg:text-lg font-bold uppercase leading-tight">
                STISIP SYAMSUL ULUM
              </span>
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex relative flex-1 max-w-lg mx-8"
            >
              <input
                type="text"
                placeholder="Cari berita, karya ilmiah, galeri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md px-4 py-2 text-sm bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-800 hover:text-blue-900"
              >
                <Search size={18} />
              </button>
            </form>

            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {isClient && token ? (
                <div className="flex items-center gap-1 lg:gap-2">
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2 rounded-md px-3 lg:px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-3 lg:px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                pathname !== "/login" && (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 rounded-md border bg-blue-950 border-white px-3 lg:px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden lg:inline">LOGIN</span>
                    <ExternalLink className="h-3 w-3 lg:hidden" />
                  </Link>
                )
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden ml-2 p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Cari di sini ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md px-4 py-2 text-sm bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-800 hover:text-blue-900"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {!pathname.startsWith("/dashboard") && (
        <nav className="hidden md:block bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-12">
              <ul className="flex items-center gap-2 text-sm font-semibold text-sky-600">
                {navigationData.map((item) => (
                  <li
                    key={item.id}
                    className="relative h-full flex items-center"
                  >
                    {renderLink(item)}

                    <AnimatePresence>
                      {item.submenus &&
                        item.submenus.length > 0 &&
                        openMenu === item.id && (
                          <MotionDiv
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute left-0 top-full w-56 z-50"
                          >
                            <ul className="rounded-b-md bg-blue-100 py-2 text-sky-600 shadow-lg ring-1 ring-blue-200">
                              {item.submenus.map((submenu) => (
                                <li
                                  key={submenu.id}
                                  className="px-4 py-2 rounded-md hover:bg-blue-200 transition-all"
                                >
                                  {renderLink(submenu)}
                                </li>
                              ))}
                            </ul>
                          </MotionDiv>
                        )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {!pathname.startsWith("/dashboard") && mobileMenuOpen && (
        <nav className="md:hidden bg-white shadow-md border-t">
          <div className="container mx-auto px-4 py-4">
            <ul className="space-y-1 mt-2 gap-2">
              {navigationData.map((item) => (
                <li key={item.id}>
                  <div className="text-blue-800 font-semibold">
                    {renderLink(item, true)}
                  </div>
                  {item.submenus &&
                    item.submenus.length > 0 &&
                    openMobileSubmenu === item.id && (
                      <ul className="mt-2 space-y-5 border-l-2  border-blue-100 ml-4">
                        {item.submenus.map((submenu) => (
                          <li
                            key={submenu.id}
                            className="text-blue-700 font-normal"
                          >
                            {renderLink(submenu, true)}
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t pt-4 flex flex-col gap-2">
              {isClient && token ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-blue-800 px-4 py-2 rounded hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 px-4 py-2 rounded hover:bg-red-100"
                  >
                    <LogOut size={16} />
                    LOGOUT
                  </button>
                </>
              ) : (
                pathname !== "/login" && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-800 px-4 py-2 rounded hover:bg-gray-100"
                  >
                    <LogIn size={16} />
                    Login
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
