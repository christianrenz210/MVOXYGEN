import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Users, Package, DollarSign, TrendingUp, ShoppingCart, AlertCircle, CheckCircle, Clock, User, Calendar, Phone, ArrowLeft, ArrowRight, Activity } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const useScrollAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return [ref, isVisible] as const;
};

interface RentalRequest {
    id: number;
    customer: {
        name: string;
        email: string;
    };
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    contact_number: string;
    address: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    days_until_return?: number;
    rental?: {
        pickup_date?: string;
    };
}

interface Activity {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    customer?: {
        id: number;
        name: string;
    };
    rental_request?: {
        id: number;
        tank_type: string;
    };
    action: string;
    description: string;
    type: string;
    created_at: string;
}

interface Tank {
    id: number;
    tank_id: string;
    tank_type: string;
    quantity: number;
    last_refilled: string | null;
    status: string;
}

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    activities?: Activity[];
    rentalStats?: {
        pending: number;
        approved: number;
        rejected: number;
        completed: number;
    };
    pendingRentalRequests?: RentalRequest[];
    rentalPagination?: {
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    tanks?: Tank[];
}

export default function Dashboard({
    breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }],
    activities: initialActivities = [],
    rentalStats: initialRentalStats = { pending: 0, approved: 0, rejected: 0, completed: 0 },
    pendingRentalRequests = [],
    rentalPagination = { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false },
    tanks = []
}: Props) {
    const [activeTab, setActiveTab] = useState('inventory');
    const [activityFilter, setActivityFilter] = useState<'latest' | 'recent'>('latest');
    const [statsPeriod, setStatsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [rentalStats, setRentalStats] = useState(initialRentalStats);
    const [activityPage, setActivityPage] = useState(1);
    const itemsPerPage = 5;

    const [headerRef, headerVisible] = useScrollAnimation();
    const [chartRef, chartVisible] = useScrollAnimation();
    const [activityRef, activityVisible] = useScrollAnimation();
    const [tankRef, tankVisible] = useScrollAnimation();

    // Filter activities based on filter
    const filteredActivities = activities.filter(activity => {
        if (activityFilter === 'latest') {
            return true; // Show all for latest
        } else if (activityFilter === 'recent') {
            const hoursAgo = 24;
            const activityDate = new Date(activity.created_at);
            const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
            return activityDate >= cutoff;
        }
        return true;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (activityPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    // Prepare chart data using real rental stats
    const chartData = [
        { name: 'Pending', value: rentalStats.pending, color: '#3b82f6' },
        { name: 'Approved', value: rentalStats.approved, color: '#22c55e' },
        { name: 'Rejected', value: rentalStats.rejected, color: '#ef4444' },
        { name: 'Completed', value: rentalStats.completed, color: '#a855f7' },
    ];

    const handleActivityPrevPage = () => {
        if (activityPage > 1) {
            setActivityPage(activityPage - 1);
        }
    };

    const handleActivityNextPage = () => {
        if (activityPage < totalPages) {
            setActivityPage(activityPage + 1);
        }
    };

    // Reset page when filter changes
    useEffect(() => {
        setActivityPage(1);
    }, [activityFilter]);

    // Fetch statistics based on selected period
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('period', statsPeriod);
        if (statsPeriod === 'monthly') {
            url.searchParams.set('month', selectedMonth);
        }
        router.get(url.pathname + url.search, {}, {
            preserveState: true,
            onSuccess: (page: any) => {
                if (page.props.rentalStats) {
                    setRentalStats(page.props.rentalStats);
                }
            }
        });
    }, [statsPeriod, selectedMonth]);
    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this rental request?')) {
            router.post(`/rentals/${id}/approve`, {}, {
                onSuccess: () => {
                    router.reload();
                }
            });
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(`/rentals/${id}/reject`, { rejected_reason: reason }, {
                onSuccess: () => {
                    router.reload();
                }
            });
        }
    };

    const handlePrevPage = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('rental_page', (rentalPagination.currentPage - 1).toString());
        router.visit(url.pathname + url.search);
    };

    const handleNextPage = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('rental_page', (rentalPagination.currentPage + 1).toString());
        router.visit(url.pathname + url.search);
    };

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-gray-50 p-6 w-full max-w-none">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {/* Header */}
                <div ref={headerRef} className={`mb-8 ${headerVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome to MV Oxygen Trading Management System</p>
                </div>

                {/* Pending Requests Alert */}
                {pendingRentalRequests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-800">
                                        {pendingRentalRequests.length} Pending Request{pendingRentalRequests.length > 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-blue-700 text-sm">
                                        You have pending rental requests that need your attention
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4" />
                                Review Now
                            </button>
                        </div>
                        
                        {/* Quick Preview of Pending Requests */}
                        <div className="space-y-3">
                            {pendingRentalRequests.slice(0, 3).map((request) => (
                                <div key={request.id} className="bg-white rounded-lg p-3 border border-blue-200 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium text-gray-800 text-sm">{request.customer.name}</span>
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Pending</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Package className="w-3 h-3 text-gray-400" />
                                                    {request.tank_type} ({request.quantity})
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {new Date(request.start_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1 ml-2">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                title="Reject"
                                            >
                                                <AlertCircle className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingRentalRequests.length > 3 && (
                                <div className="text-center">
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View all {pendingRentalRequests.length} pending requests →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                <div ref={chartRef} className={`bg-white rounded-xl shadow-lg p-6 mb-8 ${chartVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Rental Request Statistics</h2>
                            {statsPeriod === 'monthly' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500">
                                        {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                                        />
                                        <Calendar className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setStatsPeriod('daily')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    statsPeriod === 'daily'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setStatsPeriod('weekly')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    statsPeriod === 'weekly'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setStatsPeriod('monthly')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    statsPeriod === 'monthly'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Chart - Left Side */}
                        <div className="flex-1" style={{ height: '350px', minHeight: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Color Indicators - Right Side */}
                        <div className="flex flex-row md:flex-col gap-3 md:w-32">
                            <div className="bg-blue-50 rounded-lg p-3 text-center flex-1">
                                <div className="w-4 h-4 rounded-full bg-blue-500 mx-auto mb-1"></div>
                                <span className="text-sm text-gray-600">Pending</span>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center flex-1">
                                <div className="w-4 h-4 rounded-full bg-green-500 mx-auto mb-1"></div>
                                <span className="text-sm text-gray-600">Approved</span>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center flex-1">
                                <div className="w-4 h-4 rounded-full bg-red-500 mx-auto mb-1"></div>
                                <span className="text-sm text-gray-600">Rejected</span>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3 text-center flex-1">
                                <div className="w-4 h-4 rounded-full bg-purple-500 mx-auto mb-1"></div>
                                <span className="text-sm text-gray-600">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div ref={activityRef} className={`bg-white rounded-xl shadow-lg p-6 mb-8 ${activityVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Activity Feed
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActivityFilter('latest')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activityFilter === 'latest'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Latest
                            </button>
                            <button
                                onClick={() => setActivityFilter('recent')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activityFilter === 'recent'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Recent (24h)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paginatedActivities.length > 0 ? (
                            paginatedActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        activity.type === 'success' ? 'bg-green-100 text-green-600' :
                                        activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                        activity.type === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            by {activity.user.name} • {new Date(activity.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        activity.type === 'success' ? 'bg-green-100 text-green-800' :
                                        activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                        activity.type === 'error' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {activity.action}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No activities found.</p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Page {activityPage} of {totalPages} ({filteredActivities.length} activities)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleActivityPrevPage}
                                        disabled={activityPage === 1}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleActivityNextPage}
                                        disabled={activityPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tank Inventory */}
                <div ref={tankRef} className={`bg-white rounded-xl shadow-lg p-6 ${tankVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Tank Management</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Refilled</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tanks.length > 0 ? (
                                    tanks.map((tank) => (
                                        <tr key={tank.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                            <td className="py-3 px-4 text-gray-800">{tank.tank_id}</td>
                                            <td className="py-3 px-4 text-gray-800">{tank.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{tank.quantity}</td>
                                            <td className="py-3 px-4 text-gray-600">{tank.last_refilled ? new Date(tank.last_refilled).toLocaleDateString() : 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    tank.status === 'available' ? 'bg-green-100 text-green-800' :
                                                    tank.status === 'rented_out' ? 'bg-blue-100 text-blue-800' :
                                                    tank.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {tank.status.charAt(0).toUpperCase() + tank.status.slice(1).replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No tanks found in inventory.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
