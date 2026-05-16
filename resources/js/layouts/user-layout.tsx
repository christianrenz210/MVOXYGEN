import { UserSidebar } from '@/components/user-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Notifications } from '@/components/notifications';
import { Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface UserLayoutProps {
    children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <UserSidebar />
                <div className="flex-1 flex flex-col">
                    {/* User Header */}
                    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                        <div className="flex items-center gap-2">
                            <AppLogo />
                        </div>
                        
                        {/* Search Bar - Center */}
                        <div className="flex-1 flex justify-center">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        {/* Notifications & User Menu - Right */}
                        <div className="flex items-center gap-2">
                            <Notifications />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage 
                                                src={auth.user.profile_image ? `/storage/${auth.user.profile_image}` : undefined} 
                                                alt={auth.user.name}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
