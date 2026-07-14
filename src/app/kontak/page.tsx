import { MapPin, Mail, Phone } from "lucide-react";
// Tipe data untuk info kontak agar lebih aman
interface ContactInfo {
  alamat: string;
  email: string;
  telepon: string;
  link_whatsapp?: string; // Jadikan opsional
  link_Maps: string;
}

// Fungsi untuk mengambil data dari API, ini akan berjalan di server
async function getContactData(): Promise<ContactInfo | null> {
  try {
    // Panggil endpoint yang benar
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/public/contact/info`,
      {
        next: { revalidate: 3600 }, // Cache data selama 1 jam
      }
    );

    if (!res.ok) {
      console.error("Gagal mengambil data kontak dari API.");
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error saat fetch data kontak:", error);
    return null;
  }
}

// Ini adalah Server Component, lebih efisien untuk halaman publik
export default async function PublicContactPage() {
  const data = await getContactData();

  if (!data) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Informasi Kontak Tidak Tersedia</h1>
        <p className="text-gray-600 mt-2">
          Gagal memuat informasi kontak dari server.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-cover bg-center bg-no-repeat min-h-[80vh] flex items-center"
      style={{ backgroundImage: "url('/images/gedung-satu.png')" }}
    >
      <div className="bg-black/50 w-full">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Bagian Informasi Kontak */}
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Hubungi Kami
                </h1>
                <p className="mt-2 text-gray-600">Kami siap membantu Anda.</p>

                <ul className="mt-8 space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Alamat Kampus
                      </h3>
                      <p className="text-gray-600">{data.alamat}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Email Resmi
                      </h3>
                      <a
                        href={`mailto:${data.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {data.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Telepon / WhatsApp
                      </h3>
                      <a
                        href={
                          data.link_whatsapp ||
                          `https://wa.me/${data.telepon.replace(/\D/g, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        {data.telepon}
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Bagian Peta */}
              <div className="relative w-full h-[300px] md:h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31686.35296997324!2d106.92404215!3d-6.91742185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e685f512cfc8d7f%3A0x401e8f1fc28d330!2sKampus%20STISIP%20Syamsul%20Ulum%20Sukabumi!5e0!3m2!1sid!2sid!4v1717651515123!5m2!1sid!2sid"
                  className="absolute inset-0 w-full h-full rounded-br-2xl md:rounded-tr-2xl shadow-lg"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Peta Lokasi Kampus"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
