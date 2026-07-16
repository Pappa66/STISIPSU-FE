"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { fetchWithAuth } from "@/utils/api";
import useSWR from "swr";
import clsx from "clsx";
import Link from "next/link";

const fetcher = (url: string) =>
  fetchWithAuth(url).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

interface NotifResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, error, mutate } = useSWR<NotifResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}api/notifications`,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = data?.unreadCount ?? 0;

  const handleMarkAllRead = async () => {
    await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}api/notifications/read-all`,
      { method: "PUT" }
    );
    mutate();
  };

  const handleMarkRead = async (id: string) => {
    await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}api/notifications/${id}/read`,
      { method: "PUT" }
    );
    mutate();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-sky-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifikasi"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm text-gray-800">Notifikasi</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-600 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {!data && !error && (
              <p className="text-center text-gray-400 py-8 text-sm">Memuat...</p>
            )}
            {error && (
              <p className="text-center text-red-400 py-8 text-sm">Gagal memuat</p>
            )}
            {data && data.notifications.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">
                Belum ada notifikasi
              </p>
            )}
            {data?.notifications.map((notif) => (
              <div
                key={notif.id}
                className={clsx(
                  "px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors",
                  !notif.isRead && "bg-sky-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => {
                          if (!notif.isRead) handleMarkRead(notif.id);
                          setOpen(false);
                        }}
                        className="text-xs text-sky-600 hover:underline"
                      >
                        Lihat
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[10px] text-gray-400 hover:text-gray-600"
                        title="Tandai dibaca"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
