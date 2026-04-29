import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const currentUrl = page.url?.split('?')[0] || '';
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.disabled ? (
                            <SidebarMenuButton className="opacity-50 cursor-not-allowed">
                                {item.icon && <item.icon />}
                                <span className="flex-1">{item.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                    Soon
                                </Badge>
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton 
                                asChild
                                isActive={currentUrl === item.url}
                            >
                                <a href={item.url} className="flex items-center gap-2 no-underline text-inherit">
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
