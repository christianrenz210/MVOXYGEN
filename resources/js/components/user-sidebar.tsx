import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Package, ShoppingCart, User, Settings, Home, PlusCircle, History, DollarSign } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

const mainNavItems: NavItem[] = [
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

export function UserSidebar() {
    const { props } = usePage<SharedData>();
    const billingInfo = props.billingInfo as any;
    const totalOutstandingBalance = props.totalOutstandingBalance as number;

    const formatCurrency = (value: number) => {
        const numValue = isNaN(value) || value === null || value === undefined ? 0 : value;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(numValue);
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/user/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                
                {/* Payment Billing Section */}
                {(billingInfo && billingInfo.length > 0) || (totalOutstandingBalance && totalOutstandingBalance > 0) ? (
                    <SidebarGroup>
                        <SidebarGroupLabel className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4" />
                            Payment Billing
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <Link 
                                href="/user/dashboard"
                                className={`block p-3 rounded-lg mx-2 mb-2 hover:shadow-md transition-shadow ${
                                    totalOutstandingBalance && totalOutstandingBalance > 0
                                        ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                                        : 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-medium ${
                                        totalOutstandingBalance && totalOutstandingBalance > 0
                                            ? 'text-amber-800'
                                            : 'text-emerald-800'
                                    }`}>
                                        {totalOutstandingBalance && totalOutstandingBalance > 0
                                            ? 'Outstanding Balance'
                                            : 'All Settled'
                                        }
                                    </span>
                                    <span className={`text-sm font-bold ${
                                        totalOutstandingBalance && totalOutstandingBalance > 0
                                            ? 'text-amber-900'
                                            : 'text-emerald-900'
                                    }`}>
                                        {totalOutstandingBalance ? formatCurrency(totalOutstandingBalance) : '₱0.00'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
