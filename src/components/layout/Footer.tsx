"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Footer() {
  const { data: footerData } = useSWR<FooterLinks>(
    `${process.env.NEXT_PUBLIC_API_URL}api/public/footer-links`,
    fetcher
  );
  const { data: kontak } = useSWR<ContactInfo>(
    `${process.env.NEXT_PUBLIC_API_URL}api/public/contact/info`,
    fetcher
  );

  const dynamicSections = footerData?.sections || [];

  return (
    <footer className="bg-[#1f2937] text-gray-300 border-t-4 border-blue-500">
      <div className="container mx-auto px-4 py-8 lg:py-12">
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
                LPPM
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

          {/* Dynamic sections from admin */}
          {dynamicSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm lg:text-base">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url || "#"}
                      target={link.isExternal ? "_blank" : "_self"}
                      rel={link.isExternal ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2 hover:text-blue-300 transition-colors group"
                    >
                      {link.label}
                      {link.isExternal && (
                        <ExternalLink
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Row */}
        {(kontak?.alamat || kontak?.telepon || kontak?.email) && (
          <div className="mt-8 pt-6 border-t border-gray-600">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-400">
              {kontak?.alamat && (
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <MapPin size={16} className="shrink-0 text-blue-400" />
                  <span>{kontak.alamat}</span>
                </div>
              )}
              {kontak?.telepon && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-blue-400" />
                  <span>{kontak.telepon}</span>
                </div>
              )}
              {kontak?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="shrink-0 text-blue-400" />
                  <span>{kontak.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-600 text-center">
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

interface FooterLink {
  label: string;
  url: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterLinks {
  sections: FooterSection[];
}

interface ContactInfo {
  alamat: string;
  email: string;
  telepon: string;
  link_google_maps?: string;
}
