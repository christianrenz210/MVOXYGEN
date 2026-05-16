import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, ShoppingCart, Users, BarChart3, Settings, FileText, RefreshCw, Home, PlusCircle, History, Building2, Truck, DollarSign, Activity } from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Customer',
        url: '/customer',
        icon: Users,
    },
        {
        title: 'Rentals',
        url: '/rentals',
        icon: Package,
    },
    {
        title: 'Refills',
        url: '/refills',
        icon: RefreshCw,
    },
    {
        title: 'Suppliers',
        url: '/suppliers',
        icon: Building2,
    },
    {
        title: 'Inventory',
        url: '/inventory',
        icon: FileText,
    },
    {
        title: 'Purchase Order',
        url: '/purchase-order',
        icon: Truck,
    },
    {
        title: 'Reports',
        url: '/reports',
        icon: BarChart3,
    },
    {
        title: 'Activity Logs',
        url: '/activity-logs',
        icon: Activity,
    },
    {
        title: 'Settings',
        url: '/admin/settings',
        icon: Settings,
    }
];

const userNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/user/dashboard',
        icon: Home,
    },
    {
        title: 'New Request',
        url: '/user/rentals/create',
        icon: PlusCircle,
    },
    {
        title: 'My Rentals',
        url: '/user/rentals',
        icon: Package,
    },
    {
        title: 'History',
        url: '/user/history',
        icon: History,
        disabled: true,
    },
    {
        title: 'Settings',
        url: '/user/settings',
        icon: Settings,
    }
];

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
        url: '/supplier/settings',
        icon: Settings,
    }
];

const footerNavItems: NavItem[] = [
    // Repository and documentation items removed
];

export function AppSidebar() {
    const { url } = usePage().props;
    const isUserPage = typeof url === 'string' && url.includes('/user');
    const isSupplierPage = typeof url === 'string' && url.includes('/supplier');
    
    // Choose navigation items based on current page
    const navItems = isSupplierPage ? supplierNavItems : (isUserPage ? userNavItems : adminNavItems);
    const logoHref = isSupplierPage ? '/supplier/dashboard' : (isUserPage ? '/user/dashboard' : '/dashboard');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
