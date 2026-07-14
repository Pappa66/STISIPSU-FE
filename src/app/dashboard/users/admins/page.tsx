"use client";

import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UserManagementModule from "@/components/dashboard/UserManagementModule";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AdminsPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const helpText = (
    <p className="text-sm text-gray-600">
      Halaman ini digunakan untuk mengelola pengguna dengan peran sebagai{" "}
      <strong className="text-gray-800 font-medium">Admin</strong>. Admin
      memiliki hak akses tertinggi di sistem.
    </p>
  );

  if (!showContent)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <section className="max-w-screen-lg mx-auto">
        <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: "Users", href: "/dashboard" },
              { label: "Admins" },
            ]}
          />

          <div className="mt-6">
            <UserManagementModule
              role="ADMIN"
              pageTitle="Kelola Admin"
              apiEndpoint="api/users/admins"
              helpText={helpText}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
