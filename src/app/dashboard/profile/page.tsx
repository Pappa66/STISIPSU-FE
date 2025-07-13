'use client';

import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';

// Tipe data untuk user profile
interface UserProfile {
    name: string;
    email: string;
    userCode: string;
    role: string;
}

// Fungsi fetcher untuk SWR
const fetcher = (url: string, token: string | null) => 
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
         .then(res => res.data);

// --- KOMPONEN BARU: Untuk menampilkan info statis ---
const ProfileInfo = ({ user }: { user: UserProfile }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <UserCircle className="h-8 w-8 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Informasi Profil</h2>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Nama Lengkap</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{user.name}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Kode Pengguna</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{user.userCode}</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-blue-700 bg-blue-50 p-4 rounded-md mt-6">
                <Info size={20} className="flex-shrink-0 mt-0.5" />
                <span>Untuk perubahan nama atau email, silakan hubungi pihak Administrasi.</span>
            </div>
        </div>
    );
};


// --- KOMPONEN DIREVISI: Form Ganti Password dengan fitur "mata" ---
const PasswordForm = ({ token }: { token: string | null }) => {
    const { logout } = useAuthStore();
    const router = useRouter();
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State untuk visibility password
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validasi form
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Konfirmasi password baru tidak cocok.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('Password baru minimal harus 6 karakter.');
            return;
        }
        
        setIsLoading(true);
        try {
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}api/users/change-password`, 
                { oldPassword: formData.oldPassword, newPassword: formData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(res.data.message + " Anda akan diarahkan ke halaman login dalam 3 detik.");
            
            // Logout dan redirect setelah berhasil
            setTimeout(() => {
                logout();
                router.push('/login?message=Password+berhasil+diubah.+Silakan+login+kembali.');
            }, 3000);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Gagal mengganti password.');
            } else {
                setError('Terjadi kesalahan yang tidak terduga.');
            }
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <Lock className="h-8 w-8 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Ganti Password</h2>
            </div>
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                <input type={showOld ? 'text' : 'password'} name="oldPassword" value={formData.oldPassword} onChange={(e) => setFormData({...formData, oldPassword: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input type={showNew ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <input type={showConfirm ? 'text' : 'password'} name="confirmNewPassword" value={formData.confirmNewPassword} onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {message && <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-md"><CheckCircle size={16} />{message}</div>}
            {error && <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-md"><AlertCircle size={16} />{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
                {isLoading ? 'Mengganti...' : 'Ganti Password'}
            </button>
        </form>
    );
}

// Komponen Utama Halaman
export default function ProfilePage() {
    const { token } = useAuthStore();
    const { data: user, error, isLoading } = useSWR<UserProfile>(
        token ? `${process.env.NEXT_PUBLIC_API_URL}api/users/profile` : null,
        // --- PERBAIKAN: Tambahkan tipe 'string' ke parameter 'url' ---
        (url: string) => fetcher(url, token)
    );

    if (isLoading) return <div className="text-center py-20">Memuat data profil...</div>;
    if (error) return <div className="text-center py-20 text-red-600">Gagal memuat profil.</div>;
    if (!user) return <div className="text-center py-20 text-gray-500">Data profil tidak ditemukan.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pengaturan Profil</h1>
                    <p className="text-gray-600">Kelola informasi akun dan keamanan Anda.</p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <ArrowLeft size={16} />
                    Kembali ke Dashboard
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-white rounded-lg border shadow-sm">
                    <ProfileInfo user={user} />
                </div>
                <div className="p-6 bg-white rounded-lg border shadow-sm">
                    <PasswordForm token={token} />
                </div>
            </div>
        </div>
    );
}
