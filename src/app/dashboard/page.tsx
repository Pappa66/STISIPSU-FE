'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ElementType } from 'react';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
// --- PERBAIKAN: Impor ikon 'Upload' dan semua ikon lainnya ---
import { 
    Users, BookCopy, Menu, Newspaper, Briefcase, UserCircle, ShieldCheck, 
    FileText, GalleryVertical, Phone, Megaphone, Upload
} from 'lucide-react';

interface DecodedToken {
    userId: string;
    role: 'ADMIN' | 'MAHASISWA' | 'DOSEN';
    name: string;
    userCode: string;
    exp: number;
}

interface DashboardCardProps {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  colorClass: string;
}

const DashboardCard = ({ href, icon: Icon, title, description, colorClass }: DashboardCardProps) => (
    <Link href={href} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1">
        <Icon className={`h-12 w-12 ${colorClass} mb-4`} />
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1 text-center">{description}</p>
    </Link>
);


export default function DashboardPage() {
    const { token, logout } = useAuthStore();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [userCode, setUserCode] = useState('');

    useEffect(() => {
        if (!token) {
            router.replace('/login');
        } else {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
                router.replace('/login');
            } else {
                setUserRole(decoded.role);
                setUserName(decoded.name);
                setUserCode(decoded.userCode);
            }
          } catch(e) {
            logout();
            router.replace('/login');
          }
        }
    }, [token, router, logout]);

    if (!userRole) {
        return <div className="text-center py-20">Memuat dasbor...</div>;
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Selamat Datang, {userName}!</h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-600">
                <p className="text-md">Anda login sebagai: <span className="font-semibold text-indigo-600">{userRole}</span></p>
                <span className="hidden sm:block">|</span>
                <p className="text-md">Kode Anda: <span className="font-semibold text-teal-600">{userCode}</span></p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tampilan untuk ADMIN */}
                {userRole === 'ADMIN' && (
                    <>
                        {/* --- Kelompok Pengelolaan Pengguna --- */}
                        <DashboardCard href="/dashboard/users/students" icon={Users} title="Kelola Mahasiswa" description="Atur data semua mahasiswa." colorClass="text-blue-600" />
                        <DashboardCard href="/dashboard/users/lecturers" icon={Briefcase} title="Kelola Dosen" description="Atur data semua dosen." colorClass="text-indigo-600" />
                        <DashboardCard href="/dashboard/users/admins" icon={ShieldCheck} title="Kelola Admin" description="Atur data administrator lain." colorClass="text-red-600" />
                        
                        {/* --- Kelompok Pengelolaan Konten & Tampilan --- */}
                        <DashboardCard href="/dashboard/pages" icon={FileText} title="Kelola Halaman" description="Edit konten halaman statis." colorClass="text-cyan-600" />
                        <DashboardCard href="/dashboard/news" icon={Newspaper} title="Kelola Berita" description="Publikasikan artikel & berita." colorClass="text-orange-600" />
                        <DashboardCard href="/dashboard/gallery" icon={GalleryVertical} title="Kelola Galeri" description="Atur koleksi foto kegiatan." colorClass="text-pink-600" />
                        <DashboardCard href="/dashboard/announcements" icon={Megaphone} title="Kelola Pengumuman" description="Atur pop-up pengumuman." colorClass="text-amber-600" />
                        <DashboardCard href="/dashboard/menu" icon={Menu} title="Kelola Menu" description="Atur navigasi utama website." colorClass="text-purple-600" />
                        <DashboardCard href="/dashboard/contact" icon={Phone} title="Kelola Kontak" description="Perbarui info kontak kampus." colorClass="text-lime-600" />
                        
                        {/* Modul Akademik */}
                        <DashboardCard href="/dashboard/repository" icon={BookCopy} title="Kelola Repository" description="Atur semua karya ilmiah." colorClass="text-green-600" />
                    </>
                )}
                
                {/* Tampilan untuk MAHASISWA */}
                {userRole === 'MAHASISWA' && (
                    <>
                        {/* Kode ini tidak akan error lagi karena 'Upload' sudah di-impor */}
                        <DashboardCard href="/dashboard/my-repository" icon={Upload} title="Repository Saya" description="Unggah & kelola karya ilmiah." colorClass="text-sky-600" />
                        <DashboardCard href="/dashboard/profile" icon={UserCircle} title="Profil Saya" description="Lihat info & ganti password." colorClass="text-teal-600" />
                    </>
                )}

                {/* Tampilan untuk DOSEN */}
                {userRole === 'DOSEN' && (
                    <>
                        <DashboardCard href="/dashboard/advising" icon={Briefcase} title="Bimbingan Saya" description="Review & setujui karya ilmiah." colorClass="text-indigo-600" />
                        <DashboardCard href="/dashboard/profile" icon={UserCircle} title="Profil Saya" description="Lihat info & ganti password." colorClass="text-teal-600" />
                    </>
                )}
            </div>
        </div>
    );
}
