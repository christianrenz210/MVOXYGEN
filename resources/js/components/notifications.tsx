import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Package, Calendar, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface Notification {
    id: number;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    time?: string;
    read: boolean;
    link?: string;
    created_at: string;
}

export function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/notifications', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Set empty notifications on error to prevent infinite loading
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch notifications when dropdown opens (to get latest)
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        // Update local state immediately for better UX
        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );

        try {
            // Mark as read in backend
            await fetch(`/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            // Navigate if link exists
            if (notification.link) {
                router.visit(notification.link);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert state if failed
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: false } : n)
            );
        }
    };
    
    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'info':
            default:
                return <Package className="w-4 h-4 text-blue-500" />;
        }
    };

    const getIconBg = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-100';
            case 'warning':
                return 'bg-yellow-100';
            case 'error':
                return 'bg-red-100';
            case 'info':
            default:
                return 'bg-blue-100';
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
                <Bell className={`w-5 h-5 ${loading ? 'animate-pulse text-blue-500' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg border">
                        <CardContent className="p-0">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={fetchNotifications}
                                        disabled={loading}
                                        className="p-1 hover:bg-gray-100"
                                        title="Refresh notifications"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-gray-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-sm">Loading notifications...</p>
                                    </div>
                                ) : notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                                !notification.read ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-sm text-gray-800 truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {notification.time || new Date(notification.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No notifications</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t bg-gray-50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="w-full text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Mark all as read
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
