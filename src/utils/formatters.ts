/**
 * Memformat nama lengkap menjadi format "NamaBelakang, NamaDepan."
 * Contoh: "Abdul Ghani" menjadi "Ghani, Abdul."
 * Contoh: "John Fitzgerald Kennedy" menjadi "Kennedy, John Fitzgerald."
 * @param fullName Nama lengkap yang akan diformat.
 * @returns Nama yang sudah diformat.
 */
export const formatAuthorName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return '';
  }

  const nameParts = fullName.trim().split(' ').filter(part => part);

  if (nameParts.length === 1) {
    return `${nameParts[0]}.`;
  }

  const lastName = nameParts.pop(); // Ambil elemen terakhir sebagai nama belakang
  const firstNames = nameParts.join(' '); // Gabungkan sisanya sebagai nama depan

  return `${lastName}, ${firstNames}.`;
};
