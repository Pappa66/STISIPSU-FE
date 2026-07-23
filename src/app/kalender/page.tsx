"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const TYPE_LABELS: Record<string, string> = {
  academic: "Akademik", holiday: "Libur", exam: "Ujian", registration: "Pendaftaran", other: "Lainnya",
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

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-sky-700 text-white py-10 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Kalender Pendidikan</h1>
        <p className="mt-2 text-sky-100">Tahun Akademik {year}/{year + 1}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full transition">
              <ChevronLeft size={22} />
            </button>
            <h2 className="text-xl font-bold">{MONTHS[month - 1]} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full transition">
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-3 bg-gray-50">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} className="min-h-[90px] md:min-h-[110px] bg-gray-50/50" />;
              const day = parseInt(dateStr.split("-")[2]);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`min-h-[90px] md:min-h-[110px] p-1.5 border-b border-r text-left transition hover:bg-blue-50 relative ${
                    isSelected ? "bg-blue-100 ring-2 ring-inset ring-sky-500" : ""
                  } ${isToday ? "bg-sky-50" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                    isToday ? "bg-sky-600 text-white" : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className="text-[10px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium"
                        style={{ backgroundColor: ev.color }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} lainnya</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("id-ID", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">Tidak ada event pada tanggal ini.</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map(ev => (
                  <div key={ev.id} className="flex gap-3 p-3 rounded-lg border-l-4" style={{ borderLeftColor: ev.color, backgroundColor: ev.color + "08" }}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{ev.title}</p>
                      {ev.description && <p className="text-xs text-gray-600 mt-1">{ev.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] px-1.5 py-0.5 rounded font-medium text-white" style={{ backgroundColor: ev.color }}>
                          {TYPE_LABELS[ev.type] || ev.type}
                        </span>
                        {ev.endDate && ev.endDate.slice(0, 10) !== selectedDate && (
                          <span className="text-[11px] text-gray-400">
                            ({new Date(ev.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — {new Date(ev.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
