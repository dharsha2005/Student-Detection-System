
'use client';

import { Sidebar } from '@/components/Sidebar';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-slate-50">
                <Sidebar />
                <main className="pl-64 min-h-screen transition-all duration-300">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SessionProvider>
    );
}
