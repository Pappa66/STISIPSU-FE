"use client";

import { UploadTask } from "@/hooks/useBackgroundUpload";

export function UploadProgressBadge({ task }: { task: UploadTask }) {
  if (task.status === "done") return null;
  if (task.status === "error")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {task.error || "Gagal"}
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
      {task.progress}%
    </span>
  );
}

export function UploadProgressBar({ task }: { task: UploadTask }) {
  if (task.status === "done") return null;

  const color =
    task.status === "error"
      ? "bg-red-500"
      : task.status === "pending"
      ? "bg-gray-300"
      : "bg-blue-500";

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${task.progress}%` }}
      />
    </div>
  );
}
