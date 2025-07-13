'use client';
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import UserManagementModule from "@/components/dashboard/UserManagementModule";

export default function AdminsPage() {
    const helpText = (
        <p>Halaman ini digunakan untuk mengelola pengguna dengan peran sebagai <strong>Admin</strong>. Admin memiliki hak akses tertinggi di sistem.</p>
    );

    return (
        <div className="container py-8">
            <Breadcrumbs 
                items={[
                    { label: 'Users', href: '/dashboard' },
                    { label: 'Admins' }
                ]}
            />
            <UserManagementModule 
                role="ADMIN"
                pageTitle="Kelola Admin"
                apiEndpoint="api/users/admins"
                helpText={helpText}
            />
        </div>
    );
}