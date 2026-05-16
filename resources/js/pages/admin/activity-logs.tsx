import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, Activity, Package, Truck, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityLog {
    id: number;
    user_id: number;
    user_name: string;
    action: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
        role?: string;
    };
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ActivityLogsPageProps {
    logs?: ActivityLog[];
    success?: string;
    pagination?: PaginationData;
}

export default function ActivityLogs({ logs = [], success, pagination }: ActivityLogsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    
    // Use server-side pagination data
    const currentPage = pagination?.current_page || 1;
    const totalPages = pagination?.last_page || 1;
    const totalLogs = pagination?.total || logs.length;
    const itemsPerPage = pagination?.per_page || 50;

    const page = usePage();
    const flashSuccess = (page.props as any).flash?.success as string | undefined;

    useEffect(() => {
        if (flashSuccess) {
            console.log('Activity Logs flash success:', flashSuccess);
        }
    }, [flashSuccess]);

    // Client-side filtering on current page data
    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchQuery === '' || 
            log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesDate = dateFilter === 'all' || log.created_at.startsWith(dateFilter);
        
        return matchesSearch && matchesAction && matchesDate;
    });

    // Use logs directly since they're already paginated from server
    const currentLogs = filteredLogs;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + filteredLogs.length - 1, totalLogs);

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'login':
            case 'logout':
                return 'bg-green-100 text-green-800';
            case 'create':
            case 'update':
                return 'bg-blue-100 text-blue-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'view':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'login':
                return <CheckCircle className="h-4 w-4" />;
            case 'logout':
                return <RotateCcw className="h-4 w-4" />;
            case 'create':
                return <Package className="h-4 w-4" />;
            case 'update':
                return <Activity className="h-4 w-4" />;
            case 'delete':
                return <XCircle className="h-4 w-4" />;
            case 'error':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getUniqueDates = () => {
        const dates = new Set(logs.map(log => log.created_at.split(' ')[0]));
        return Array.from(dates).sort((a, b) => b.localeCompare(a));
    };

    const exportLogs = () => {
        const csvContent = [
            ['ID', 'User', 'Action', 'Description', 'IP Address', 'User Agent', 'Date'],
            ...filteredLogs.map(log => [
                log.id,
                log.user_name,
                log.action,
                log.description,
                log.ip_address,
                log.user_agent,
                log.created_at
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <AppLayout>
            <Head title="Activity Logs" />
            
            <div className="space-y-8 px-6 py-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                        <p className="text-gray-600">Monitor all system activities and user actions</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={exportLogs} className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by user, action, or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        <SelectItem value="login">Login</SelectItem>
                                        <SelectItem value="logout">Logout</SelectItem>
                                        <SelectItem value="create">Create</SelectItem>
                                        <SelectItem value="update">Update</SelectItem>
                                        <SelectItem value="delete">Delete</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                        <SelectItem value="view">View</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Dates</SelectItem>
                                        {getUniqueDates().map(date => (
                                            <SelectItem key={date} value={date}>{date}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.length}</div>
                            <p className="text-xs text-muted-foreground">All activities</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {logs.filter(log => log.created_at.startsWith(new Date().toISOString().split('T')[0])).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Actions today</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(logs.map(log => log.user_id)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">Active users</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {logs.filter(log => log.action.toLowerCase().includes('error')).length > 0 
                                    ? `${((logs.filter(log => log.action.toLowerCase().includes('error')).length / logs.length) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">Error activities</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {currentLogs.length === 0 ? (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
                                <p className="text-gray-600">
                                    {searchQuery || actionFilter !== 'all' || dateFilter !== 'all' 
                                        ? 'No logs match your current filters. Try adjusting your search criteria.'
                                        : 'No activity logs have been recorded yet.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentLogs.map((log, index) => (
                                            <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{log.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                                                            {getActionIcon(log.action)}
                                                        </div>
                                                        <span className="font-medium">{log.user_name}</span>
                                                        {log.user?.role && (
                                                            <Badge variant="secondary" className="ml-2">
                                                                {log.user.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getActionColor(log.action)}>
                                                        {log.action}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {log.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-white border-t mt-4">
                                <div className="text-sm text-gray-700">
                                    Showing {startIndex} to {endIndex} of {totalLogs} total activities
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => router.visit(route('activity-logs.index', { page: currentPage - 1 }))}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-3 py-2 text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        onClick={() => router.visit(route('activity-logs.index', { page: currentPage + 1 }))}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Add extra padding at bottom */}
            <div className="pb-8"></div>
        </AppLayout>
    );
}
