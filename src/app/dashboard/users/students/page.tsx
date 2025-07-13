'use client';
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UserManagementModule from "@/components/dashboard/UserManagementModule";
import React from "react";

export default function StudentsPage() {
    const helpText = (
        <p>Halaman ini digunakan untuk mengelola pengguna dengan peran sebagai <strong>Mahasiswa</strong>. Anda dapat memfilter berdasarkan Program Studi dan Tahun Masuk.</p>
    );

    return (
        <div className="container py-8 mx-auto">
            <Breadcrumbs 
                items={[
                    // Link 'Users' di sini aman karena kita sudah membuat redirect
                    { label: 'Users', href: '/dashboard' }, 
                    { label: 'Mahasiswa' }
                ]}
            />
            <UserManagementModule 
                role="MAHASISWA"
                pageTitle="Kelola Mahasiswa"
                apiEndpoint="api/users/students"
                helpText={helpText}
            />
        </div>
    );
}
