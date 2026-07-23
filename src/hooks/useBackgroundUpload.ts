"use client";

import { useState, useCallback, useRef } from "react";

export interface UploadTask {
  id: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  response?: unknown;
  error?: string;
}

export function useBackgroundUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadTask>>({});
  const xhrMap = useRef<Record<string, XMLHttpRequest>>({});

  const startUpload = useCallback(
    (
      id: string,
      url: string,
      formData: FormData,
      method: "POST" | "PUT" = "POST",
      token?: string
    ): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        setUploads((prev) => ({
          ...prev,
          [id]: { id, progress: 0, status: "pending" },
        }));

        const xhr = new XMLHttpRequest();
        xhrMap.current[id] = xhr;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) => ({
              ...prev,
              [id]: { ...prev[id], progress: pct, status: "uploading" },
            }));
          }
        };

        xhr.onload = () => {
          delete xhrMap.current[id];
          let data;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = xhr.responseText;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads((prev) => ({
              ...prev,
              [id]: { id, progress: 100, status: "done", response: data },
            }));
            resolve(data);
          } else {
            const errMsg =
              data?.message || `Upload gagal (${xhr.status})`;
            setUploads((prev) => ({
              ...prev,
              [id]: { ...prev[id], status: "error", error: errMsg },
            }));
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => {
          delete xhrMap.current[id];
          setUploads((prev) => ({
            ...prev,
            [id]: { ...prev[id], status: "error", error: "Network error" },
          }));
          reject(new Error("Network error"));
        };

        xhr.onabort = () => {
          delete xhrMap.current[id];
          setUploads((prev) => ({
            ...prev,
            [id]: { ...prev[id], status: "error", error: "Dibatalkan" },
          }));
          reject(new Error("Dibatalkan"));
        };

        xhr.open(method, url);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    },
    []
  );

  const cancelUpload = useCallback((id: string) => {
    if (xhrMap.current[id]) {
      xhrMap.current[id].abort();
      delete xhrMap.current[id];
    }
    setUploads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return { uploads, startUpload, cancelUpload, clearUpload };
}
