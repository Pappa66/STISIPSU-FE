import { useAuthStore } from '@/store/authStore';

// Ini adalah wrapper untuk fungsi fetch standar
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Ambil token dari state management (Zustand)
  const { token, logout } = useAuthStore.getState();

  // Siapkan header standar untuk setiap request
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Set Content-Type jika bodynya adalah JSON
  if (options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Cek jika token sudah tidak valid (kedaluwarsa atau salah)
    if (response.status === 401) {
      // Hapus token dari state dan localStorage
      logout();
      // Beri notifikasi ke user
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      // Redirect ke halaman login (cara aman untuk redirect di luar komponen)
      window.location.href = '/login'; 
      // Lemparkan error agar proses selanjutnya berhenti
      throw new Error('Sesi telah berakhir.');
    }

    return response;

  } catch (error) {
    // Tangani error jaringan atau error dari throw di atas
    console.error('API call error:', error);
    // Lemparkan lagi errornya agar bisa ditangani oleh komponen pemanggil jika perlu
    throw error;
  }
};
