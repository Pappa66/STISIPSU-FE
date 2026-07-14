"use client";

import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UserManagementModule from "@/components/dashboard/UserManagementModule";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function StudentsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const helpText = (
    <p className="text-sm text-gray-600">
      Halaman ini digunakan untuk mengelola pengguna dengan peran sebagai{" "}
      <strong className="font-semibold text-gray-800">Mahasiswa</strong>. Anda
      dapat memfilter berdasarkan Program Studi dan Tahun Masuk.
    </p>
  );

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );

  return (
    <main className="px-4 sm:px-5 md:px-6 lg:px-8 py-6 w-full overflow-x-hidden">
      <section className="w-full max-w-full sm:max-w-screen-xl mx-auto">
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-5 lg:p-6 overflow-x-auto">
          <Breadcrumbs
            items={[
              { label: "Users", href: "/dashboard" },
              { label: "Mahasiswa" },
            ]}
          />

          <div className="mt-6">
            <UserManagementModule
              role="MAHASISWA"
              pageTitle="Kelola Mahasiswa"
              apiEndpoint="api/users/students"
              helpText={helpText}
              usePagination={true}
              responsiveColumns={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
