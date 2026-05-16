import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { CashierHeader } from '@/components/cashier-header';
import { usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';

export default function CashierLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="header">
            <AppContent variant="full">
                <CashierHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
