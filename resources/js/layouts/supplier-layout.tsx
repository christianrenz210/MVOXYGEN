import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SupplierSidebar } from '@/components/supplier-sidebar';

interface SupplierLayoutProps {
    children: ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
    return (
        <SidebarProvider>
            <SupplierSidebar />
            <SidebarInset>
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
