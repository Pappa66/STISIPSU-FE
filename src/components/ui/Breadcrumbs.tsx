'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
        <Home size={16} />
        <span>Dashboard</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={18} className="mx-1" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-gray-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}