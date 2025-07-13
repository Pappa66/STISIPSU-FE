'use client';

import React, { useState, useEffect, useMemo, useRef, FormEvent, ChangeEvent } from 'react';
import useSWR from 'swr';
import { fetchWithAuth } from '@/utils/api';
import Spinner from '@/components/ui/Spinner';
import { Edit, Trash2, UserPlus, Upload, Search, Download, X, KeyRound, Info, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';

// Definisikan tipe data
interface User {
    id: string; name: string; email: string; role: 'ADMIN' | 'MAHASISWA' | 'DOSEN';
    userCode: string; studyProgram?: string | null; npm?: string | null;
    entryYear?: number | null; npd?: string | null;
}
interface DecodedToken { userId: string; }

// Props untuk komponen modular kita
interface UserManagementModuleProps {
    role: 'ADMIN' | 'DOSEN' | 'MAHASISWA';
    pageTitle: string;
    apiEndpoint: string;
    helpText: React.ReactNode;
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('Gagal mengambil data pengguna.');
    return res.json();
});

export default function UserManagementModule({ role, pageTitle, apiEndpoint, helpText }: UserManagementModuleProps) {
    const [currentUserId, setCurrentUserId] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // State filter
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [prodiFilter, setProdiFilter] = useState('ALL');
    const [tahunFilter, setTahunFilter] = useState('');
    const [debouncedTahunFilter, setDebouncedTahunFilter] = useState('');
    
    // State form tambah
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [studyProgram, setStudyProgram] = useState('Ilmu Pemerintahan');
    const [npm, setNpm] = useState('');
    const [entryYear, setEntryYear] = useState(new Date().getFullYear());
    const [npd, setNpd] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State untuk Modal Ekspor
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportProdi, setExportProdi] = useState('ALL');
    const [exportTahun, setExportTahun] = useState('');

    // Debounce effects
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedTahunFilter(tahunFilter), 500);
        return () => clearTimeout(handler);
    }, [tahunFilter]);

    // API URL dinamis berdasarkan props
    const apiUrl = useMemo(() => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${apiEndpoint}`);
        if (debouncedSearchQuery) url.searchParams.append('search', debouncedSearchQuery);
        if (role === 'MAHASISWA') {
            if (prodiFilter !== 'ALL') url.searchParams.append('studyProgram', prodiFilter);
            if (debouncedTahunFilter) url.searchParams.append('entryYear', debouncedTahunFilter);
        }
        return url.toString();
    }, [apiEndpoint, debouncedSearchQuery, prodiFilter, debouncedTahunFilter, role]);

    const { data: users = [], error, isLoading, mutate } = useSWR<User[]>(apiUrl, fetcher);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Ambil dari localStorage atau state management Anda
        if (token) {
            const decoded: DecodedToken = jwtDecode(token);
            setCurrentUserId(decoded.userId);
        }
    }, []);

    const resetAddForm = () => {
        setName(''); setEmail(''); setPassword(''); setNpm(''); setNpd('');
        setStudyProgram('Ilmu Pemerintahan');
        setEntryYear(new Date().getFullYear());
    };

    const handleCreateUser = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name, email, password, role,
                studyProgram: role === 'MAHASISWA' ? studyProgram : null,
                npm: role === 'MAHASISWA' ? npm : null,
                entryYear: role === 'MAHASISWA' ? entryYear : null,
                npd: role === 'DOSEN' ? npd : null,
            };
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/users`, { method: 'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal membuat pengguna');
            
            mutate();
            setShowAddForm(false);
            resetAddForm();
            alert(data.message);
        } catch (err: any) { alert(err.message); } 
        finally { setIsSubmitting(false); }
    };
    
    // --- PERBAIKAN: Mengisi semua fungsi yang hilang ---

    const handleDownloadTemplate = () => {
        const workbook = XLSX.utils.book_new();
        const mhsHeaders = {'Nama Lengkap':"", 'Email':"", 'Password':"", 'Program Studi':"Ilmu Pemerintahan", 'NPM':"", 'Tahun Masuk':""};
        const wsMhs = XLSX.utils.json_to_sheet([mhsHeaders],{skipHeader:true});
        XLSX.utils.sheet_add_aoa(wsMhs, [Object.keys(mhsHeaders)], { origin: "A1" });
        Object.keys(wsMhs).forEach(cell => { if (cell.match(/^[A-Z]1$/)) wsMhs[cell].s = { font: { bold: true } }; });
        wsMhs['!dataValidation'] = [{ sqref: 'D2:D1000', validation: { type: 'list', allowBlank: true, formulae: ['"Ilmu Pemerintahan,Ilmu Administrasi Negara"'] } }];
        wsMhs['!cols'] = [{wch:30},{wch:30},{wch:20},{wch:30},{wch:15},{wch:15}];
        XLSX.utils.book_append_sheet(workbook, wsMhs, "Template Mahasiswa");

        const dosenHeaders = {'Nama Lengkap':"", 'Email':"", 'Password':"", 'NPD/NIDN':""};
        const wsDosen = XLSX.utils.json_to_sheet([dosenHeaders],{skipHeader:true});
        XLSX.utils.sheet_add_aoa(wsDosen, [Object.keys(dosenHeaders)], { origin: "A1" });
        Object.keys(wsDosen).forEach(cell => { if (cell.match(/^[A-Z]1$/)) wsDosen[cell].s = { font: { bold: true } }; });
        wsDosen['!cols'] = [{wch:30},{wch:30},{wch:20},{wch:20}];
        XLSX.utils.book_append_sheet(workbook, wsDosen, "Template Dosen");

        XLSX.writeFile(workbook, "template_import_pengguna_multi.xlsx");
    };
    
    const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsSubmitting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const workbook = XLSX.read(e.target?.result, { type: 'binary' });
                let allNewUsers: any[] = [];

                const wsMhs = workbook.Sheets["Template Mahasiswa"];
                if (wsMhs) {
                    const jsonMhs: any[] = XLSX.utils.sheet_to_json(wsMhs);
                    const newMahasiswa = jsonMhs.map(row => ({
                        name: row['Nama Lengkap'], email: row['Email'], password: String(row['Password']),
                        role: 'MAHASISWA',
                        studyProgram: row['Program Studi'], npm: String(row['NPM']), entryYear: Number(row['Tahun Masuk'])
                    }));
                    allNewUsers = allNewUsers.concat(newMahasiswa);
                }

                const wsDosen = workbook.Sheets["Template Dosen"];
                if (wsDosen) {
                    const jsonDosen: any[] = XLSX.utils.sheet_to_json(wsDosen);
                    const newDosen = jsonDosen.map(row => ({
                        name: row['Nama Lengkap'], email: row['Email'], password: String(row['Password']),
                        role: 'DOSEN',
                        npd: row['NPD/NIDN'] ? String(row['NPD/NIDN']) : null
                    }));
                    allNewUsers = allNewUsers.concat(newDosen);
                }

                if (allNewUsers.length === 0) {
                    alert('File Excel kosong atau tidak ada data valid di kedua sheet.');
                    return;
                }
                
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/users/bulk`, { method: 'POST', body: JSON.stringify(allNewUsers) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Gagal impor data");
                alert(data.message);
                mutate();
            } catch (err: any) { alert(err.message); } 
            finally { if (fileInputRef.current) fileInputRef.current.value = ""; setIsSubmitting(false); }
        };
        reader.readAsBinaryString(file);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/users/${userId}`, { method: 'DELETE' });
            mutate();
            alert('Pengguna berhasil dihapus.');
        } catch (err: any) { alert(err.message || 'Gagal menghapus pengguna.'); }
    };

    const handleUpdateUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSubmitting(true);
        try {
            const payload = { 
                name: editingUser.name, 
                email: editingUser.email, 
                role: editingUser.role, 
                studyProgram: editingUser.role === 'MAHASISWA' ? editingUser.studyProgram : null, 
                npm: editingUser.role === 'MAHASISWA' ? editingUser.npm : null, 
                entryYear: editingUser.role === 'MAHASISWA' ? editingUser.entryYear : null, 
                npd: editingUser.role === 'DOSEN' ? editingUser.npd : null, 
            };
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            mutate(); 
            setEditingUser(null); 
            alert('Pengguna berhasil diperbarui.');
        } catch (err: any) { alert(err.message || 'Gagal memperbarui pengguna.'); } 
        finally { setIsSubmitting(false); }
    };

    const handleResetPassword = async (userId: string) => {
        const newPassword = window.prompt('Masukkan password baru (minimal 6 karakter):');
        if (!newPassword || newPassword.length < 6) { 
            alert('Reset dibatalkan atau password terlalu pendek.'); 
            return; 
        }
        try {
            await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}api/users/${userId}/reset-password`, { method: 'PUT', body: JSON.stringify({ password: newPassword }) });
            alert('Password berhasil direset.');
        } catch (err: any) { alert(err.message || 'Gagal mereset password.'); }
    };
    
    const handleExport = async (options: { role: 'ADMIN' | 'DOSEN' | 'MAHASISWA'; prodi?: string; tahun?: string; }) => {
        setIsSubmitting(true);
        try {
            // Menggunakan endpoint yang lebih spesifik
            let endpoint = '';
            if (options.role === 'ADMIN') endpoint = 'api/users/admins';
            else if (options.role === 'DOSEN') endpoint = 'api/users/lecturers';
            else if (options.role === 'MAHASISWA') endpoint = 'api/users/students';

            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
            if (options.role === 'MAHASISWA') {
                if (options.prodi && options.prodi !== 'ALL') url.searchParams.append('studyProgram', options.prodi);
                if (options.tahun) url.searchParams.append('entryYear', options.tahun);
            }
            const dataToExport = await fetcher(url.toString());
            if (dataToExport.length === 0) { 
                alert('Tidak ada data untuk diekspor dengan filter ini.'); 
                setIsSubmitting(false); 
                return; 
            }
            const formattedData = dataToExport.map((user: User) => ({ 
                'Kode Pengguna': user.userCode, 
                'Nama Lengkap': user.name, 
                'Email': user.email, 
                'Peran': user.role, 
                'Program Studi': user.studyProgram || '', 
                'NPM': user.npm || '', 
                'Tahun Masuk': user.entryYear || '', 
                'NPD/NIDN': user.npd || '' 
            }));
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Data ${options.role}`);
            XLSX.writeFile(workbook, `export_pengguna_${options.role.toLowerCase()}_${Date.now()}.xlsx`);
        } catch (err) { alert('Gagal mengekspor data.'); } 
        finally { setIsSubmitting(false); setShowExportModal(false); }
    };
    
    if (error) return <div className="container py-8 text-center text-red-500">{error.message}</div>;

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
                <div className="flex gap-2">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={16}/> Template</button>
                    <input ref={fileInputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileImport}/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isSubmitting} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 disabled:bg-green-400"><Spinner size="sm" className={isSubmitting ? '' : 'hidden'}/> <Upload size={16} className={isSubmitting ? 'hidden' : ''}/> Import</button>
                    <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700"><Download size={16}/> Eksport</button>
                    <button onClick={() => { setShowAddForm(!showAddForm); if (!showAddForm) resetAddForm(); }} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"><UserPlus size={16}/> {showAddForm ? 'Tutup' : 'Tambah Baru'}</button>
                </div>
            </div>
            
            <div className="mb-4 p-4 border-l-4 border-sky-400 bg-sky-50 text-sky-800 rounded-r-lg text-sm">
                <div className="flex gap-3"><Info size={20} className="flex-shrink-0 mt-0.5" />
                    <div>{helpText}</div>
                </div>
            </div>

            {showAddForm && (
                <div className="mb-8 p-6 border rounded-lg bg-white shadow-md animate-in fade-in-50">
                     <h2 className="text-xl font-semibold mb-4">Tambah {role.charAt(0) + role.slice(1).toLowerCase()} Baru</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-xs font-medium">Nama Lengkap</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md mt-1" required /></div>
                            <div><label className="text-xs font-medium">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md mt-1" required /></div>
                            <div className="relative"><label className="text-xs font-medium">Password Awal</label><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 pr-10 border rounded-md mt-1" minLength={6} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-500"><EyeOff size={18} className={!showPassword ? 'hidden' : ''}/><Eye size={18} className={showPassword ? 'hidden' : ''}/></button></div>
                        </div>
                        {role === 'MAHASISWA' && (<>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-xs font-medium">Program Studi</label><select value={studyProgram} onChange={e => setStudyProgram(e.target.value)} className="w-full p-2 border rounded-md mt-1 h-[42px]"><option value="Ilmu Pemerintahan">Ilmu Pemerintahan</option><option value="Ilmu Administrasi Negara">Ilmu Administrasi Negara</option></select></div>
                                <div><label className="text-xs font-medium">NPM</label><input type="text" placeholder="Maks 10 digit" value={npm} onChange={e => setNpm(e.target.value.replace(/\D/g, ''))} maxLength={10} className="w-full p-2 border rounded-md mt-1" required /></div>
                                <div><label className="text-xs font-medium">Tahun Masuk</label><input type="number" placeholder="Contoh: 2024" value={entryYear} onChange={e => setEntryYear(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1" required /></div>
                            </div>
                        </>)}
                        {role === 'DOSEN' && (
                            <div><label className="text-xs font-medium">NPD/NIDN</label><input type="text" value={npd} onChange={e => setNpd(e.target.value.replace(/\D/g, ''))} maxLength={18} placeholder="Maks 18 digit" className="w-full p-2 border rounded-md mt-1" required /></div>
                        )}
                        <div className="flex justify-end"><button type="submit" disabled={isSubmitting} className="flex justify-center items-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 w-32">{isSubmitting ? <Spinner size="sm"/> : 'Tambah'}</button></div>
                    </form>
                </div>
            )}
            
            <div className="mb-4 p-4 border rounded-lg bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="md:col-span-2 relative"><label className="text-xs font-medium">Cari Nama / Email / Kode</label><Search size={18} className="absolute left-3 bottom-2.5 text-gray-400" /><input type="text" placeholder="Cari..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full mt-1 p-2 pl-10 border rounded-md" /></div>
                {role === 'MAHASISWA' && (<>
                    <div><label className="text-xs font-medium">Filter Prodi</label><select value={prodiFilter} onChange={e => setProdiFilter(e.target.value)} className="w-full mt-1 p-2 border rounded-md h-[42px]"><option value="ALL">Semua Prodi</option><option value="Ilmu Pemerintahan">Ilmu Pemerintahan</option><option value="Ilmu Administrasi Negara">Ilmu Administrasi Negara</option></select></div>
                    <div><label className="text-xs font-medium">Filter Tahun Masuk</label><input type="number" placeholder="Semua" value={tahunFilter} onChange={e => setTahunFilter(e.target.value)} className="w-full mt-1 p-2 border rounded-md" /></div>
                </>)}
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg border">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500 flex items-center justify-center"><Spinner size="md" /> <span className="ml-2">Memuat data pengguna...</span></div>
                ) : users.length === 0 ? (
                    <p className="text-center p-8 text-gray-500">Tidak ada pengguna yang cocok dengan filter saat ini.</p>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="p-4 text-left font-semibold">Nama</th><th className="p-4 text-left font-semibold">Email</th><th className="p-4 text-left font-semibold">Kode</th><th className="p-4 text-left font-semibold">Peran & Detail</th><th className="p-4 text-center font-semibold">Aksi</th></tr></thead>
                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="p-4 font-medium">{user.name}</td><td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4 font-mono text-xs text-gray-500">{user.userCode}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`w-fit px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : (user.role === 'DOSEN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')}`}>{user.role}</span>
                                            {user.role === 'MAHASISWA' && <span className="text-xs text-gray-500 mt-1">NPM: {user.npm || '-'} | {user.studyProgram}</span>}
                                            {user.role === 'DOSEN' && <span className="text-xs text-gray-500 mt-1">NPD: {user.npd || '-'}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => setEditingUser(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit Pengguna"><Edit size={16} /></button>
                                            <button onClick={() => handleResetPassword(user.id)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-md" disabled={user.id === currentUserId} title="Reset Password"><KeyRound size={16} /></button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" disabled={user.id === currentUserId || user.role === 'ADMIN'} title="Hapus Pengguna"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Edit Pengguna: {editingUser.name}</h2><button onClick={() => setEditingUser(null)}><X size={24} /></button></div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div><label className="block text-sm font-medium">Nama</label><input type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-sm font-medium">Email</label><input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full p-2 border rounded mt-1" /></div>
                            <div><label className="block text-sm font-medium">Peran</label><select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any, studyProgram: e.target.value === 'MAHASISWA' ? editingUser.studyProgram || 'Ilmu Pemerintahan' : null, npm: editingUser.role === 'MAHASISWA' ? editingUser.npm || '' : null, entryYear: editingUser.role === 'MAHASISWA' ? editingUser.entryYear || new Date().getFullYear() : null, npd: editingUser.role === 'DOSEN' ? editingUser.npd || '' : null })} className="w-full p-2 border rounded mt-1"><option value="MAHASISWA">Mahasiswa</option><option value="DOSEN">Dosen</option><option value="ADMIN">Admin</option></select></div>
                            {editingUser.role === 'MAHASISWA' && (
                                <>
                                    <div><label className="block text-sm font-medium">Program Studi</label><select value={editingUser.studyProgram || ''} onChange={e => setEditingUser({ ...editingUser, studyProgram: e.target.value })} className="w-full p-2 border rounded mt-1"><option value="Ilmu Pemerintahan">Ilmu Pemerintahan</option><option value="Ilmu Administrasi Negara">Ilmu Administrasi Negara</option></select></div>
                                    <div><label className="block text-sm font-medium">NPM</label><input type="text" value={editingUser.npm || ''} onChange={e => setEditingUser({ ...editingUser, npm: e.target.value.replace(/\D/g, '')})} pattern="[0-9]*" maxLength={10} className="w-full p-2 border rounded mt-1" /></div>
                                    <div><label className="block text-sm font-medium">Tahun Masuk</label><input type="number" value={editingUser.entryYear || ''} onChange={e => setEditingUser({ ...editingUser, entryYear: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" /></div>
                                </>
                            )}
                            {editingUser.role === 'DOSEN' && (
                                <div><label className="block text-sm font-medium">NPD/NIDN</label><input type="text" value={editingUser.npd || ''} onChange={e => setEditingUser({ ...editingUser, npd: e.target.value.replace(/\D/g, '') })} maxLength={18} className="w-full p-2 border rounded mt-1" /></div>
                            )}
                            <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded border">Batal</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-blue-600 text-white flex items-center justify-center">{isSubmitting ? <Spinner size="sm"/> : 'Simpan'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Ekspor Data Pengguna</h2><button onClick={() => setShowExportModal(false)}><X size={24}/></button></div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Pilih jenis data yang ingin Anda unduh ke file Excel.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => handleExport({ role: 'ADMIN' })} disabled={isSubmitting} className="p-4 bg-red-50 hover:bg-red-100 rounded-md text-red-800 font-semibold text-left">Ekspor Semua Admin</button>
                                <button onClick={() => handleExport({ role: 'DOSEN' })} disabled={isSubmitting} className="p-4 bg-green-50 hover:bg-green-100 rounded-md text-green-800 font-semibold text-left">Ekspor Semua Dosen</button>
                            </div>
                            <div className="p-4 border rounded-md mt-4">
                                <h3 className="font-semibold mb-3">Ekspor Pengguna Mahasiswa</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div><label className="text-xs font-medium">Program Studi</label><select value={exportProdi} onChange={e => setExportProdi(e.target.value)} className="w-full mt-1 p-2 border rounded-md h-[42px]"><option value="ALL">Semua Prodi</option><option value="Ilmu Pemerintahan">Ilmu Pemerintahan</option><option value="Ilmu Administrasi Negara">Ilmu Administrasi Negara</option></select></div>
                                    <div><label className="text-xs font-medium">Tahun Masuk</label><input type="number" placeholder="Semua" value={exportTahun} onChange={e => setExportTahun(e.target.value)} className="w-full mt-1 p-2 border rounded-md" /></div>
                                    <button onClick={() => handleExport({ role: 'MAHASISWA', prodi: exportProdi, tahun: exportTahun })} disabled={isSubmitting} className="flex justify-center items-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 h-full">
                                        {isSubmitting ? <Spinner size="sm" /> : 'Ekspor Mahasiswa'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}