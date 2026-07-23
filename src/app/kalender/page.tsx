"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, Umbrella, FileCheck, ClipboardList, GraduationCap, Calendar } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  type: string;
  color: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  academic: { label: "Akademik", icon: BookOpen },
  holiday: { label: "Libur", icon: Umbrella },
  exam: { label: "Ujian", icon: FileCheck },
  registration: { label: "Pendaftaran", icon: ClipboardList },
};
const TYPE_COLORS: Record<string, string> = {
  academic: "#0077c2", holiday: "#e53935", exam: "#fb8c00", registration: "#43a047", other: "#6c757d",
};

export default function KalenderPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: events } = useSWR<CalendarEvent[]>(
    `${apiUrl}/api/calendar?year=${year}&month=${month}`,
    fetcher
  );

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const goPrev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const goNext = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    if (!events) return map;
    for (const ev of events) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="relative bg-gradient-to-r from-sky-700 via-sky-600 to-blue-600 text-white px-4 py-12 md:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative">
          <CalendarDays className="inline-block w-10 h-10 mb-3 text-sky-200" />
          <h1 className="text-3xl md:text-4xl font-bold">Kalender Pendidikan</h1>
          <p className="mt-2 text-sky-100 text-sm md:text-base">Tahun Akademik {year}/{year + 1}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT: Calendar Grid */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-4">
                <button onClick={goPrev} className="p-2.5 hover:bg-sky-50 rounded-xl transition active:scale-90 text-sky-600">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {MONTHS[month - 1]} <span className="text-sky-600">{year}</span>
                </h2>
                <button onClick={goNext} className="p-2.5 hover:bg-sky-50 rounded-xl transition active:scale-90 text-sky-600">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 bg-sky-100 gap-[1px]">
                {DAYS.map(d => (
                  <div key={d} className="bg-sky-50/80 text-center text-xs font-semibold text-sky-600 py-2.5">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-sky-100 gap-[1px]">
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
                      <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold mb-1 mx-auto transition ${
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
                            className="text-[9px] md:text-[10px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium shadow-sm"
                            style={{ backgroundColor: ev.color }}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] md:text-[10px] text-gray-400 font-medium pl-1">+{dayEvents.length - 2}</div>
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
            <div className="bg-white rounded-2xl shadow-xl shadow-sky-900/5 border border-sky-100 p-4 md:p-5 sticky top-6">
              {/* Legend */}
              <div className="space-y-2.5 pb-4 mb-4 border-b border-sky-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</p>
                {Object.entries(TYPE_COLORS).map(([type, color]) => {
                  const meta = TYPE_META[type] || { label: type, icon: CalendarDays };
                  const Icon = meta.icon;
                  return (
                    <div key={type} className="inline-flex items-center gap-2 text-sm text-gray-600 leading-none">
                      <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                      <Icon size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{meta.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Detail */}
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
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {selectedEvents.map(ev => {
                        const meta = TYPE_META[ev.type] || { label: ev.type, icon: CalendarDays };
                        const Icon = meta.icon;
                        return (
                          <div key={ev.id} className="p-3 rounded-xl border border-sky-100 hover:border-sky-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-start gap-2.5">
                              <div className="w-1 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: ev.color }} />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-xs text-gray-800 leading-snug">{ev.title}</p>
                                {ev.description && (
                                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{ev.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: ev.color }}>
                                    <Icon size={9} />
                                    {meta.label}
                                  </span>
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
                  <Calendar size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Klik tanggal untuk melihat event</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
