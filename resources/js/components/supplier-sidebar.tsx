import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Home, Package, Settings, Building2, Truck, FileText } from 'lucide-react';
import AppLogo from './app-logo';

const supplierNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/supplier/dashboard',
        icon: Home,
    },
    {
        title: 'Orders',
        url: '/supplier/orders',
        icon: Package,
    },
    {
        title: 'Settings',
        url: '/user/settings',
        icon: Settings,
    }
];

const footerNavItems: NavItem[] = [
    // Repository and documentation items removed
];

export function SupplierSidebar() {
    const { url } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/supplier/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={supplierNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
