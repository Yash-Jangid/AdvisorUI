'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/templates/Navbar';
import { Sidebar } from '@/components/templates/Sidebar';
import { useAuth } from '@/lib/api/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Hydrate user profile from backend on mount and sync with Zustand
  useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onMobileMenuToggle={() => setSidebarOpen((v) => !v)}
        isMobileMenuOpen={sidebarOpen}
      />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-6 lg:px-8"
          tabIndex={-1}
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
