"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import { UserPlus, ChevronRight, Mail, Users, ChevronLeft } from "lucide-react";

// Tipe data untuk mahasiswa bimbingan
interface AdvisedStudent {
  id: string;
  name: string;
  npm: string | null;
  userCode: string;
  pendingItemsCount: number;
}
// Tipe data untuk respons API yang menyertakan pagination
interface PaginatedResponse {
  students: AdvisedStudent[];
  currentPage: number;
  totalPages: number;
}

// Fetcher untuk SWR
const fetcher = (url: string, token: string | null) =>
  axios
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);

export default function AdvisingPage() {
  const { token } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);

  // SWR key sekarang menyertakan currentPage agar data di-fetch ulang saat halaman berubah
  const { data, error, isLoading } = useSWR<PaginatedResponse>(
    token
      ? `${process.env.NEXT_PUBLIC_API_URL}api/advisor/students?page=${currentPage}`
      : null,
    (url: string) => fetcher(url, token)
  );

  // Ekstrak data dari respons
  const students = data?.students || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading)
    return (
      <div className="container py-12 text-center">
        Memuat data mahasiswa...
      </div>
    );
  if (error)
    return (
      <div className="container py-12 text-center text-red-500">
        Gagal memuat data.
      </div>
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Bimbingan Saya</h1>
              <p className="text-gray-500">
                Pilih mahasiswa untuk melihat dan mereview karya ilmiah mereka.
              </p>
            </div>
            <Link
              href="/dashboard/advising/add-student"
              className="flex items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <UserPlus size={16} />
              Tambah Mahasiswa
            </Link>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <ul className="divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student) => (
                  <li key={student.id}>
                    <Link
                      href={`/dashboard/advising/students/${student.id}`}
                      className="block hover:bg-gray-50"
                    >
                      <div className="flex items-center p-4 sm:px-6">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {student.name}
                              </p>
                              <p className="mt-1 flex items-center text-sm text-gray-500">
                                <span className="truncate">
                                  NPM: {student.npm || "-"}
                                </span>
                              </p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-sm text-gray-900">
                                Kode: {student.userCode}
                              </p>
                            </div>
                            <div>
                              {student.pendingItemsCount > 0 && (
                                <p className="flex items-center text-sm text-yellow-800 bg-yellow-100 w-fit px-2 py-1 rounded-full">
                                  <Mail className="mr-1.5 h-4 w-4" />
                                  {student.pendingItemsCount} kiriman baru
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <div className="text-center p-16">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Belum Ada Mahasiswa Bimbingan
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Gunakan tombol "Tambah Mahasiswa" untuk memulai.
                  </p>
                </div>
              )}
            </ul>
          </div>

          {/* --- KONTROL PAGINATION --- */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <span className="text-sm text-gray-700">
                Halaman <strong>{currentPage}</strong> dari{" "}
                <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
