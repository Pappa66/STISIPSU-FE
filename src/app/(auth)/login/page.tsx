'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // State baru untuk menandai sukses
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok && data.token) {
                login(data.token);
                
                // --- PERBAIKAN UX & REDIRECT ---
                // 1. Tampilkan pesan sukses
                setMessage('Login berhasil! Mengarahkan ke Dashboard...');
                setIsSuccess(true);

                // 2. Beri jeda sebelum redirect agar pesan terbaca & state terupdate
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500); // Tunggu 1.5 detik

            } else {
                setMessage(data.message || 'Login gagal.');
                setIsSuccess(false);
            }
        } catch (error) {
            setMessage('Terjadi kesalahan pada jaringan.');
            setIsSuccess(false);
        } finally {
            // Jangan set isLoading ke false jika sudah sukses, biarkan tombol disabled
            // Ini akan di-handle oleh setTimeout dan perpindahan halaman
            if (!isSuccess) {
                setIsLoading(false);
            }
        }
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Image
                        src="/logo-stisip.png" // Pastikan path ke logo Anda benar
                        alt="Logo STISIP Syamsul 'Ulum"
                        width={80}
                        height={80}
                        className="mx-auto"
                    />
                </div>
                
                <div className="rounded-2xl border bg-white p-8 shadow-lg">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Login ke Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Masukkan email dan password Anda untuk melanjutkan.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Alamat Email
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                    placeholder="anda@kampus.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* --- PERBAIKAN PESAN --- */}
                        {message && (
                            <p className={`text-center text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}

                        <div>
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                            >
                                {isLoading ? <Spinner size="sm"/> : 'Masuk'}
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} STISIP Syamsul 'Ulum. All rights reserved.
                </p>
            </div>
        </main>
    );
}
