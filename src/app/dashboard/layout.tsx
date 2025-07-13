import React from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8">
      <div className="mb-6">
        
      </div>
      {children}
    </div>
  );
}