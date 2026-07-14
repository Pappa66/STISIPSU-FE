// src/components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1f2937] text-gray-300 border-t-4 border-blue-500">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Program Studi */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
              Program Studi
            </h3>
            <ul className="space-y-2 text-sm lg:text-base">
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Ilmu Administrasi Negara
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Ilmu Pemerintahan
              </li>
            </ul>
          </div>

          {/* Lembaga dan UPT */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
              Lembaga dan UPT
            </h3>
            <ul className="space-y-2 text-sm lg:text-base">
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Biro Administrasi Akademik
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Biro Administrasi Keuangan
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Biro Umum dan Kepegawaian
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Biro Kemahasiswaan dan Alumni
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                UPT Teknologi Informasi
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                UPT Pusat Bahasa
              </li>
            </ul>
          </div>

          {/* Perpustakaan & Publikasi */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
              Perpustakaan & Publikasi
            </h3>
            <ul className="space-y-2 text-sm lg:text-base">
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Perpustakaan Digital
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Open Journal System (OJS)
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Karya Tulis Ilmiah Mahasiswa
              </li>
              <li className="hover:text-blue-300 transition-colors cursor-pointer">
                Repositori Institusi
              </li>
            </ul>
          </div>

          {/* Tautan Lainnya */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
              Tautan Lainnya
            </h3>
            <ul className="space-y-2 text-sm lg:text-base">
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  Sistem Informasi Akademik (SIAK)
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  Webmail Dosen & Staff
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  PMB Online
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  E-Complaint Mahasiswa
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  Tracer Study Alumni
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  LMS STISIP (E-Learning)
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                >
                  Helpdesk & ICT
                  <ExternalLink
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 lg:mt-10 pt-6 border-t border-gray-600 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} STISIP Syamsul Ulum Sukabumi.
              All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <p>Developed by Prasha Digital</p>
              <span className="hidden sm:inline">|</span>
              <p>Supported by ICT STISIP</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
