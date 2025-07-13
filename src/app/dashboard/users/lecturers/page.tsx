'use client';

import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UserManagementModule from "@/components/dashboard/UserManagementModule";
import React from "react"; // Impor React untuk menggunakan Fragment

export default function LecturersPage() {
    const helpText = (
        <p>Halaman ini digunakan untuk mengelola pengguna dengan peran sebagai <strong>Dosen</strong>. Pastikan setiap dosen memiliki NPD/NIDN yang valid.</p>
    );

    return (
        // --- PERBAIKAN: Bungkus semua elemen dengan satu elemen induk ---
        // Kita bisa menggunakan div atau React.Fragment (<>...</>)
        <div className="container py-8 mx-auto">
            <Breadcrumbs 
                items={[
                    // Arahkan link "Users" ke halaman default (mahasiswa) untuk menghindari 404
                    { label: 'Users', href: '/dashboard' },
                    { label: 'Dosen' }
                ]}
            />
            <UserManagementModule 
                role="DOSEN"
                pageTitle="Kelola Dosen"
                apiEndpoint="api/users/lecturers"
                helpText={helpText}
            />
        </div>
    );
}
