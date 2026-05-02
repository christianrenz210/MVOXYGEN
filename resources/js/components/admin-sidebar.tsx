import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Package, RefreshCw, FileText, BarChart3, Settings, ShoppingCart, TrendingUp, AlertCircle, Calendar, DollarSign, CreditCard } from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Customers',
        url: '/customer',
        icon: Users,
    },
    {
        title: 'Cashier',
        url: '/cashier',
        icon: CreditCard,
    },
    {
        title: 'Rentals',
        url: '/rentals',
        icon: Package,
    },
    {
        title: 'Refills',
        url: '#',
        icon: RefreshCw,
        disabled: true,
    },
    {
        title: 'Inventory',
        url: '#',
        icon: FileText,
        disabled: true,
    },
    {
        title: 'Reports',
        url: '/reports',
        icon: BarChart3,
    },
    {
        title: 'Settings',
        url: '#',
        icon: Settings,
        disabled: true,
    }
];

const footerNavItems: NavItem[] = [
    // Repository and documentation items removed
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
