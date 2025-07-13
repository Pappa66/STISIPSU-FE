import Link from 'next/link';
import { ArrowRight, BookOpen, Users, MapPin } from 'lucide-react';
import HeroSection from "@/components/home/HeroSection"; // Menggunakan HeroSection Anda

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* 1. Menggunakan Hero Section Anda yang sudah ada */}
      <HeroSection />

      {/* 2. Features Section (dari kode saya) */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Kenapa Memilih Kami?</h2>
            <p className="text-muted-foreground mt-2">Keunggulan yang kami tawarkan untuk masa depan Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-full">
                  <BookOpen className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Kurikulum Terdepan</h3>
              <p className="text-muted-foreground">
                Kurikulum yang dirancang untuk menjawab kebutuhan industri dan perkembangan zaman.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Dosen Profesional</h3>
              <p className="text-muted-foreground">
                Dibimbing oleh para akademisi dan praktisi yang ahli di bidangnya.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-full">
                  <MapPin className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Lokasi Strategis</h3>
              <p className="text-muted-foreground">
                Kampus yang mudah diakses dengan fasilitas pendukung yang lengkap dan modern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Call to Action Section (dari kode saya) */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Bergabung dengan Kami?</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Jadilah bagian dari komunitas akademik STISIP Syamsul Ulum dan raih cita-cita Anda bersama kami.
          </p>
          <Link href="/pendaftaran" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2">
            Daftar Sekarang <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
