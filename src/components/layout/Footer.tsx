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

  const sections = footerData?.sections || [];

  return (
    <footer className="bg-[#1f2937] text-gray-300 border-t-4 border-blue-500">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-white font-semibold bg-blue-600 inline-block px-3 py-1 rounded text-sm lg:text-base">
                {section.title}
              </h3>
              <ul className="space-y-1.5 text-sm lg:text-base">
                {section.links.map((link, i) => (
                  <li key={i}>
                    {link.url ? (
                      <a
                        href={link.url}
                        target={link.isExternal ? "_blank" : "_self"}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-1.5 hover:text-blue-300 transition-colors group"
                      >
                        {link.label}
                        {link.isExternal && (
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        )}
                      </a>
                    ) : (
                      <span className="text-gray-400 cursor-default">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

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
