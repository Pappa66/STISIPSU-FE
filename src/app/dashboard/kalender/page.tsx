"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetchWithAuth } from "@/utils/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Plus, Trash2, Edit3, Calendar, Info } from "lucide-react";
import { useMemo } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  type: string;
  color: string;
  isActive: boolean;
}

const fetcher = (url: string) => fetchWithAuth(url).then((r) => r.json());
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") + "/api/calendar";

const TYPE_OPTIONS = [
  { value: "academic", label: "Akademik", color: "#0077c2" },
  { value: "holiday", label: "Libur", color: "#e53935" },
  { value: "exam", label: "Ujian", color: "#fb8c00" },
  { value: "registration", label: "Pendaftaran", color: "#43a047" },
  { value: "other", label: "Lainnya", color: "#6c757d" },
];

export default function KalenderPage() {
  const { token } = useAuthStore();
  const role = useMemo(() => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split(".")[1])).role; } catch { return null; }
  }, [token]);
  const isAdmin = role === "ADMIN";
  const { data: events, isLoading } = useSWR<CalendarEvent[]>(`${apiUrl}/admin/all`, fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", endDate: "", type: "academic", color: "#0077c2" });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({ title: "", description: "", eventDate: "", endDate: "", type: "academic", color: "#0077c2" });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description || "",
      eventDate: e.eventDate.slice(0, 10),
      endDate: e.endDate ? e.endDate.slice(0, 10) : "",
      type: e.type,
      color: e.color,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.eventDate) {
      toast.error("Judul dan tanggal wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      const body = { ...form, endDate: form.endDate || null };
      if (editing) {
        await fetchWithAuth(`${apiUrl}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Event diperbarui!");
      } else {
        await fetchWithAuth(`${apiUrl}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Event ditambahkan!");
      }
      mutate(`${apiUrl}/admin/all`);
      resetForm();
    } catch {
      toast.error("Gagal menyimpan event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      await fetchWithAuth(`${apiUrl}/${id}`, { method: "DELETE" });
      toast.success("Event dihapus!");
      mutate(`${apiUrl}/admin/all`);
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetchWithAuth(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      mutate(`${apiUrl}/admin/all`);
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Kalender Pendidikan</h1>
            {isAdmin && (
              <button onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus size={18} /> Tambah Event
              </button>
            )}
          </div>

          {isAdmin && showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold mb-4">{editing ? "Edit Event" : "Event Baru"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Judul *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                  <input type="date" value={form.eventDate} onChange={(e) => setForm({...form, eventDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai (opsional)</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe</label>
                  <select value={form.type} onChange={(e) => {
                    const opt = TYPE_OPTIONS.find(t => t.value === e.target.value);
                    setForm({...form, type: e.target.value, color: opt?.color || "#0077c2"});
                  }} className="w-full px-3 py-2 border rounded-md text-sm">
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warna</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})}
                      className="w-9 h-9 p-0.5 border rounded-md cursor-pointer" />
                    <span className="text-xs text-gray-500">{form.color}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Contoh: Libur semester ganjil, Ujian Tengah Semester, dll." />
                </div>
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                  <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Panduan Pengisian Kalender:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li><strong>Akademi</strong> — kegiatan perkuliahan, seminar, workshop</li>
                      <li><strong>Libur</strong> — hari libur nasional, cuti bersama, libur semester</li>
                      <li><strong>Ujian</strong> — UTS, UAS, ujian skripsi, sidang</li>
                      <li><strong>Pendaftaran</strong> — jadwal pendaftaran mahasiswa baru, KP, dll</li>
                      <li>Event akan tampil di halaman publik <strong>/kalender</strong> dan dashboard dosen/mahasiswa</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100">Batal</button>
              </div>
            </form>
          )}

          {!events || events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada event kalender.</p>
          ) : (
            <div className="space-y-2">
              {[...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()).map((ev) => (
                <div key={ev.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!ev.isActive ? "opacity-50" : ""}`}>
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{ev.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      {new Date(ev.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {ev.endDate && (
                        <> — {new Date(ev.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</>
                      )}
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: ev.color + "20", color: ev.color }}>
                        {TYPE_OPTIONS.find(t => t.value === ev.type)?.label || ev.type}
                      </span>
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(ev.id, ev.isActive)}
                        className={`p-1.5 rounded text-xs ${ev.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                        {ev.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                      <button onClick={() => openEdit(ev)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/kalender" target="_blank" className="text-sm text-blue-600 hover:text-blue-800 underline">
            Lihat tampilan publik →
          </a>
        </div>
      </div>
    </main>
  );
}
