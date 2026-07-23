"use client";

import { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { fetchWithAuth } from "@/utils/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoadingButton from "@/components/common/LoadingButton";
import { Plus, Trash2, Edit3, CalendarDays, Info, ChevronLeft, ChevronRight, BookOpen, Umbrella, FileCheck, ClipboardList, GraduationCap } from "lucide-react";

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
const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  academic: { label: "Akademik", icon: BookOpen },
  holiday: { label: "Libur", icon: Umbrella },
  exam: { label: "Ujian", icon: FileCheck },
  registration: { label: "Pendaftaran", icon: ClipboardList },
  other: { label: "Lainnya", icon: GraduationCap },
};

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

export default function KalenderPage() {
  const { token } = useAuthStore();
  const role = useMemo(() => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split(".")[1])).role; } catch { return null; }
  }, [token]);
  const isAdmin = role === "ADMIN";
  const { data: events, isLoading } = useSWR<CalendarEvent[]>(`${apiUrl}/admin/all`, fetcher);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", endDate: "", type: "academic", color: "#0077c2" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        const res = await fetchWithAuth(`${apiUrl}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Gagal");
        toast.success("Event diperbarui!");
      } else {
        const res = await fetchWithAuth(`${apiUrl}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Gagal");
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
    setDeletingId(id);
    try {
      const res = await fetchWithAuth(`${apiUrl}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal");
      toast.success("Event dihapus!");
      mutate(`${apiUrl}/admin/all`);
    } catch {
      toast.error("Gagal menghapus.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetchWithAuth(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      if (!res.ok) throw new Error("Gagal");
      mutate(`${apiUrl}/admin/all`);
    } catch {
      toast.error("Gagal mengubah status.");
    }
  };

  // Month grid calculation
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    if (!events) return map;
    for (const ev of events) {
      if (!ev.isActive) continue;
      const start = ev.eventDate.slice(0, 10);
      const end = ev.endDate ? ev.endDate.slice(0, 10) : start;
      let d = new Date(start);
      const endD = new Date(end);
      while (d <= endD) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push(dateStr);
  }

  if (isLoading) return <div className="p-8"><LoadingSpinner /></div>;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="relative bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600 text-white px-6 py-5 rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white" />
            <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full bg-white" />
          </div>
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">Kalender Pendidikan</h1>
              <p className="text-sky-100 text-sm mt-0.5">Tahun Akademik {year}/{year + 1}</p>
            </div>
            {isAdmin && (
              <LoadingButton onClick={() => { resetForm(); setShowForm(true); }}
                className="!bg-white !text-sky-700 hover:!bg-sky-50 active:!scale-[0.97]">
                <Plus size={18} /> Tambah Event
              </LoadingButton>
            )}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-b-xl p-4 sm:p-6">

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
                      <li><strong>Akademik</strong> — kegiatan perkuliahan, seminar, workshop</li>
                      <li><strong>Libur</strong> — hari libur nasional, cuti bersama, libur semester</li>
                      <li><strong>Ujian</strong> — UTS, UAS, ujian skripsi, sidang</li>
                      <li><strong>Pendaftaran</strong> — jadwal pendaftaran mahasiswa baru, KP, dll</li>
                      <li>Event akan tampil di halaman publik <strong>/kalender</strong> dan dashboard dosen/mahasiswa</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <LoadingButton type="submit" loading={submitting}>Simpan</LoadingButton>
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition active:scale-[0.97]">Batal</button>
              </div>
            </form>
          )}

          {/* Calendar Grid + Side Panel */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* LEFT: Calendar Grid */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-lg shadow-sky-900/5">
                <div className="flex items-center justify-between px-4 md:px-6 py-4">
                  <button onClick={prevMonth} className="p-2.5 hover:bg-sky-50 rounded-xl transition active:scale-90 text-sky-600">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">{MONTHS[month - 1]} <span className="text-sky-600">{year}</span></h2>
                  <button onClick={nextMonth} className="p-2.5 hover:bg-sky-50 rounded-xl transition active:scale-90 text-sky-600">
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 bg-sky-100">
                  {DAYS.map(d => (
                    <div key={d} className="bg-sky-50/80 text-center text-xs font-semibold text-sky-600 py-2.5">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 bg-sky-100">
                  {calendarDays.map((dateStr, i) => {
                    if (!dateStr) return <div key={`empty-${i}`} className="bg-white min-h-[80px] md:min-h-[100px]" />;
                    const day = parseInt(dateStr.split("-")[2]);
                    const dayEvents = eventsByDate[dateStr] || [];
                    const isToday = dateStr === new Date().toISOString().slice(0, 10);
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`bg-white min-h-[80px] md:min-h-[100px] p-1.5 text-left transition-all duration-150 hover:bg-sky-50 relative ${
                          isSelected ? "ring-2 ring-inset ring-sky-500 bg-sky-50 z-10" : ""
                        }`}
                      >
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold mb-1 transition ${
                          isToday
                            ? "bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-sm"
                            : isSelected
                            ? "bg-sky-600 text-white"
                            : "text-gray-700"
                        }`}>
                          {day}
                        </span>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => (
                            <div key={ev.id}
                              className="text-[9px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium shadow-sm"
                              style={{ backgroundColor: ev.color }}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-gray-400 font-medium pl-1">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Side Panel */}
            <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg shadow-sky-900/5 border border-sky-100 p-4 md:p-5 sticky top-6">
                <div className="space-y-2 pb-4 mb-4 border-b border-sky-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</p>
                  {TYPE_OPTIONS.map(t => {
                    const meta = TYPE_META[t.value] || { label: t.value, icon: CalendarDays };
                    const Icon = meta.icon;
                    return (
                      <div key={t.value} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                        <Icon size={13} className="text-gray-400 flex-shrink-0" />
                        <span>{t.label}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedDate ? (
                  <div className="animate-fadeIn">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("id-ID", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </h3>
                    {selectedEvents.length === 0 ? (
                      <p className="text-xs text-gray-400">Tidak ada event</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                        {selectedEvents.map(ev => {
                          const meta = TYPE_META[ev.type] || { label: ev.type, icon: CalendarDays };
                          const Icon = meta.icon;
                          return (
                            <div key={ev.id} className="p-3 rounded-xl border border-sky-100 hover:border-sky-200 hover:shadow-sm transition-all duration-200">
                              <div className="flex items-start gap-2.5">
                                <div className="w-1 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: ev.color }} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="font-semibold text-xs text-gray-800 leading-snug">{ev.title}</p>
                                    {isAdmin && (
                                      <div className="flex items-center gap-0.5 flex-shrink-0">
                                        <button onClick={() => toggleActive(ev.id, ev.isActive)}
                                          className={`p-0.5 rounded text-[10px] transition hover:bg-gray-100 ${ev.isActive ? "text-green-600" : "text-gray-400"}`}
                                          title={ev.isActive ? "Nonaktifkan" : "Aktifkan"}>
                                          {ev.isActive ? "Aktif" : "Nonaktif"}
                                        </button>
                                        <button onClick={() => openEdit(ev)} className="p-0.5 text-blue-600 hover:bg-blue-100 rounded transition" title="Edit">
                                          <Edit3 size={12} />
                                        </button>
                                        <button onClick={() => handleDelete(ev.id)} className="p-0.5 text-red-500 hover:bg-red-100 rounded transition" title="Hapus">
                                          {deletingId === ev.id ? (
                                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                          ) : (
                                            <Trash2 size={12} />
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {ev.description && <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{ev.description}</p>}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: ev.color }}>
                                      <Icon size={9} />
                                      {meta.label}
                                    </span>
                                    {ev.isActive ? (
                                      <span className="text-[10px] text-green-600 font-medium">Aktif</span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-medium">Nonaktif</span>
                                    )}
                                    {ev.endDate && ev.endDate.slice(0, 10) !== selectedDate && (
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(ev.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                        <ChevronRight size={9} className="inline opacity-50 mx-0.5" />
                                        {new Date(ev.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Klik tanggal untuk melihat event</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
