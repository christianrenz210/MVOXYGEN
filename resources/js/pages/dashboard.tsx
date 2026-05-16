import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Users, Package, DollarSign, TrendingUp, ShoppingCart, AlertCircle, CheckCircle, Clock, User, Calendar, Phone, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Activity, Sparkles, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import ConfirmModal from '@/components/confirm-modal';
import PromptModal from '@/components/prompt-modal';

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

interface RentalStats {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
}

interface DailySales {
    total: number;
    count: number;
}

type ChartViewKey = 'rental' | 'sales' | 'transactions';

interface SalesChartDatum {
    label: string;
    amount: number;
}

interface TransactionsChartDatum {
    label: string;
    count: number;
}

interface ChartTab {
    key: ChartViewKey;
    label: string;
    description: string;
}

const DEFAULT_SALES_CHART_DATA: SalesChartDatum[] = [
    { label: 'Mon', amount: 14250 },
    { label: 'Tue', amount: 13100 },
    { label: 'Wed', amount: 16540 },
    { label: 'Thu', amount: 17220 },
    { label: 'Fri', amount: 18980 },
    { label: 'Sat', amount: 20310 },
    { label: 'Sun', amount: 15890 },
];

const DEFAULT_TRANSACTIONS_CHART_DATA: TransactionsChartDatum[] = [
    { label: 'Mon', count: 12 },
    { label: 'Tue', count: 14 },
    { label: 'Wed', count: 18 },
    { label: 'Thu', count: 21 },
    { label: 'Fri', count: 24 },
    { label: 'Sat', count: 28 },
    { label: 'Sun', count: 16 },
];

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    activities?: Activity[];
    rentalStats?: RentalStats;
    dailySales?: DailySales;
    salesChartData?: SalesChartDatum[];
    transactionsChartData?: TransactionsChartDatum[];
    pendingRentalRequests?: any[];
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
    dailySales: initialDailySales = { total: 0, count: 0 },
    salesChartData: initialSalesChartData = DEFAULT_SALES_CHART_DATA,
    transactionsChartData: initialTransactionsChartData = DEFAULT_TRANSACTIONS_CHART_DATA,
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
    const [dailySales, setDailySales] = useState(initialDailySales);

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
    });
    const [promptConfig, setPromptConfig] = useState({
        title: '',
        message: '',
        placeholder: '',
        onConfirm: (value: string) => {},
        type: 'info' as 'info' | 'warning' | 'danger'
    });

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirmModal(true);
    };

    const showPrompt = (title: string, message: string, placeholder: string, onConfirm: (value: string) => void, type: 'info' | 'warning' | 'danger' = 'info') => {
        setPromptConfig({ title, message, placeholder, onConfirm, type });
        setShowPromptModal(true);
    };
    const [activityPage, setActivityPage] = useState(1);
    const [chartView, setChartView] = useState<ChartViewKey>('rental');
    const itemsPerPage = 5;

    const [headerRef, headerVisible] = useScrollAnimation();
    const [chartRef, chartVisible] = useScrollAnimation();
    const [activityRef, activityVisible] = useScrollAnimation();
    const [tankRef, tankVisible] = useScrollAnimation();

    const salesChart = initialSalesChartData.length ? initialSalesChartData : DEFAULT_SALES_CHART_DATA;
    const transactionsChart = initialTransactionsChartData.length
        ? initialTransactionsChartData
        : DEFAULT_TRANSACTIONS_CHART_DATA;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(value);

    const formatNumber = (value: number) =>
        new Intl.NumberFormat('en-PH', {
            maximumFractionDigits: 0,
        }).format(value);

    const normalizeTooltipValue = (value: unknown) => {
        if (Array.isArray(value)) {
            const [first] = value as Array<number | string>;
            return typeof first === 'number' ? first : Number(first ?? 0);
        }
        if (value === undefined || value === null) {
            return 0;
        }
        return typeof value === 'number' ? value : Number(value ?? 0);
    };

    const salesTooltipFormatter = (
        value: unknown,
        _name?: string | number,
        _item?: unknown,
        _index?: number,
    ): [string, string] => [formatCurrency(normalizeTooltipValue(value)), 'Sales'];

    const transactionsTooltipFormatter = (
        value: unknown,
        _name?: string | number,
        _item?: unknown,
        _index?: number,
    ): [string, string] => [`${formatNumber(normalizeTooltipValue(value))} transactions`, 'Transactions'];

    const totalSalesInChart = salesChart.reduce((sum, entry) => sum + entry.amount, 0);
    const bestSalesDay = salesChart.reduce(
        (best, entry) => (entry.amount > best.amount ? entry : best),
        salesChart[0] ?? { label: 'N/A', amount: 0 },
    );

    const totalTransactionsInChart = transactionsChart.reduce((sum, entry) => sum + entry.count, 0);
    const busiestTransactionsDay = transactionsChart.reduce(
        (best, entry) => (entry.count > best.count ? entry : best),
        transactionsChart[0] ?? { label: 'N/A', count: 0 },
    );
    const averageTransactions = transactionsChart.length
        ? Math.round(totalTransactionsInChart / transactionsChart.length)
        : 0;
    const latestTransactionsCount = transactionsChart.length
        ? transactionsChart[transactionsChart.length - 1].count
        : 0;

    const chartTabs: ChartTab[] = [
        {
            key: 'rental',
            label: 'Rental Requests',
            description: `Status distribution by ${statsPeriod.charAt(0).toUpperCase() + statsPeriod.slice(1)}`,
        },
        {
            key: 'sales',
            label: 'Sales Performance',
            description: 'Revenue trend across the past 7 days',
        },
        {
            key: 'transactions',
            label: 'Transactions Volume',
            description: 'Completed transactions for the past 7 days',
        },
    ];

    const currentTabIndex = chartTabs.findIndex((tab) => tab.key === chartView);
    const currentTab = chartTabs[currentTabIndex] ?? chartTabs[0];
    const handlePrevChartView = () =>
        setChartView(chartTabs[(currentTabIndex - 1 + chartTabs.length) % chartTabs.length].key);
    const handleNextChartView = () => setChartView(chartTabs[(currentTabIndex + 1) % chartTabs.length].key);

    const chartTitle =
        chartView === 'rental'
            ? 'RENTAL REQUESTS'
            : chartView === 'sales'
            ? 'SALES PERFORMANCE'
            : 'TRANSACTIONS OVERVIEW';

    const accentClass =
        chartView === 'rental' ? 'text-[#e53935]' : chartView === 'sales' ? 'text-blue-600' : 'text-emerald-600';

    const chartAccent =
        chartView === 'rental'
            ? `by ${statsPeriod.charAt(0).toUpperCase() + statsPeriod.slice(1)}`
            : chartView === 'sales'
            ? `${formatCurrency(totalSalesInChart)} total (7 days)`
            : `${formatNumber(totalTransactionsInChart)} transactions (7 days)`;

    const chartSummary =
        chartView === 'sales'
            ? `${formatCurrency(bestSalesDay.amount)} best day (${bestSalesDay.label})`
            : chartView === 'transactions'
            ? `${formatNumber(busiestTransactionsDay.count)} peak transactions (${busiestTransactionsDay.label})`
            : `${formatNumber(
                  rentalStats.pending + rentalStats.approved + rentalStats.rejected + rentalStats.completed,
              )} total requests`;

    // Show all activities (no date filtering)
    const filteredActivities = activities.filter(activity => {
        return true; // Show all activities
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (activityPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    // Prepare chart data using real rental stats only
    const chartData = [
        { name: 'Pending', value: rentalStats.pending || 0, color: '#38bdf8' },
        { name: 'Approved', value: rentalStats.approved || 0, color: '#22c55e' },
        { name: 'Rejected', value: rentalStats.rejected || 0, color: '#f97316' },
        { name: 'Completed', value: rentalStats.completed || 0, color: '#8b5cf6' },
    ];

    // Debug: Log chart data to console
    console.log('Chart Data:', chartData);
    console.log('Rental Stats:', rentalStats);
    console.log('Stats Period:', statsPeriod);
    console.log('Pending Count:', rentalStats?.pending);
    console.log('Approved Count:', rentalStats?.approved);
    console.log('Rejected Count:', rentalStats?.rejected);
    console.log('Completed Count:', rentalStats?.completed);

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
        showConfirm(
            'Approve Rental Request',
            'Are you sure you want to approve this rental request?',
            () => {
                router.post(`/rentals/${id}/approve`, {}, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'warning'
        );
    };

    const handleReject = (id: number) => {
        showPrompt(
            'Reject Rental Request',
            'Please provide a reason for rejection:',
            'Enter rejection reason...',
            (reason) => {
                router.post(`/rentals/${id}/reject`, { rejected_reason: reason }, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'danger'
        );
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

                {/* Chart Section - Exact Design */}
                <div ref={chartRef} className={`bg-[#f5f5f5] rounded-xl shadow-lg overflow-hidden mb-8 p-8 ${chartVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="text-[28px] font-bold text-black uppercase tracking-wide">{chartTitle}</div>
                            <div className={`text-[24px] font-bold ${accentClass}`}>{chartAccent}</div>
                            <p className="mt-3 text-sm text-gray-600">{currentTab.description}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{chartSummary}</p>
                        </div>
                        <div className="flex flex-col items-start gap-3 md:items-end">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrevChartView}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    {currentTabIndex + 1} / {chartTabs.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNextChartView}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                                {chartTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setChartView(tab.key)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                            chartView === tab.key
                                                ? 'bg-black text-white shadow'
                                                : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Period Selector (Rental only) */}
                    {chartView === 'rental' && (
                        <div className="mb-6 flex items-center gap-3">
                            {statsPeriod === 'monthly' && (
                                <div className="relative">
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="text-sm border border-gray-400 bg-white text-gray-800 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                                    />
                                    <Calendar className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            )}
                            <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-300">
                                <button
                                    onClick={() => setStatsPeriod('daily')}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                        statsPeriod === 'daily'
                                            ? 'bg-black text-white font-semibold'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setStatsPeriod('weekly')}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                        statsPeriod === 'weekly'
                                            ? 'bg-black text-white font-semibold'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setStatsPeriod('monthly')}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                        statsPeriod === 'monthly'
                                            ? 'bg-black text-white font-semibold'
                                            : 'text-gray-600 hover:text-black'
                                    }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chart Area */}
                    {chartView === 'rental' ? (
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
                            <div className="flex flex-1 items-end gap-8">
                                {/* Y-Axis */}
                                <div className="flex h-[360px] flex-col justify-between pr-4">
                                    <div className="w-[20px] border-l-2 border-b-2 border-black"></div>
                                    <div className="w-[20px] border-l-2 border-b-2 border-black"></div>
                                    <div className="w-[20px] border-l-2 border-b-2 border-black"></div>
                                    <div className="w-[20px] border-l-2 border-b-2 border-black"></div>
                                    <div className="w-[20px] border-l-2 border-b-2 border-black"></div>
                                </div>

                                {/* Bars */}
                                <div className="flex h-[360px] flex-1 items-end justify-around gap-8">
                                    {(() => {
                                        const maxValue = Math.max(...chartData.map(d => d.value), 1);
                                        const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

                                        const gradientMap: Record<string, { top: string; bottom: string }> = {
                                            Pending: { top: '#e0f2fe', bottom: '#38bdf8' },
                                            Approved: { top: '#dcfce7', bottom: '#16a34a' },
                                            Rejected: { top: '#fee2e2', bottom: '#f97316' },
                                            Completed: { top: '#ede9fe', bottom: '#8b5cf6' },
                                        };

                                        return chartData.map((entry, index) => {
                                            const percentage = totalValue > 0 ? Math.round((entry.value / totalValue) * 100) : 0;
                                            const barHeight = (entry.value / maxValue) * 280;

                                            const gradient = gradientMap[entry.name] ?? gradientMap.Pending;

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col items-center"
                                                    style={{ animation: chartVisible ? `slideUp 0.8s ease-out ${index * 0.15}s both` : 'none' }}
                                                >
                                                    {/* Percentage */}
                                                    <div className="mb-2 text-[40px] font-bold text-black">
                                                        {percentage}%
                                                    </div>

                                                    {/* Quarter Label */}
                                                    <div className="mb-3 text-[18px] font-bold text-black">
                                                        {entry.name}
                                                    </div>

                                                    {/* Bar - Flat, no border radius */}
                                                    <div
                                                        className="relative flex w-[120px] flex-col justify-end"
                                                        style={{
                                                            height: `${barHeight}px`,
                                                            background: `linear-gradient(to top, ${gradient.bottom}, ${gradient.top})`,
                                                            borderRadius: '0',
                                                        }}
                                                    >
                                                        {/* Icon at bottom center */}
                                                        <div className="absolute bottom-4 left-1/2 w-full -translate-x-1/2 transform text-center">
                                                            {index === 0 && <TrendingUp className="mx-auto h-10 w-10 text-white opacity-80" />}
                                                            {index === 1 && <BarChart3 className="mx-auto h-10 w-10 text-white opacity-80" />}
                                                            {index === 2 && <Sparkles className="mx-auto h-10 w-10 text-white opacity-80" />}
                                                            {index === 3 && <Activity className="mx-auto h-10 w-10 text-white opacity-80" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            {/* Indicators */}
                            <div className="flex min-w-[220px] flex-col gap-4">
                                {chartData.map((entry, index) => {
                                    const previousValue = index > 0 ? chartData[index - 1].value : 0;
                                    const isUp = entry.value >= previousValue;

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                                            style={{ borderLeft: `6px solid ${entry.color}` }}
                                        >
                                            <div>
                                                <div className="text-base font-semibold text-gray-800">{entry.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {entry.value} {entry.value === 1 ? 'request' : 'requests'}
                                                </div>
                                            </div>
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full"
                                                style={{ backgroundColor: isUp ? '#059669' : '#dc2626' }}
                                            >
                                                {isUp ? (
                                                    <ArrowUp className="h-4 w-4 text-white" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : chartView === 'sales' ? (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
                                <div className="h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={salesChart}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                                            <XAxis dataKey="label" stroke="#4b5563" tickLine={false} />
                                            <YAxis stroke="#4b5563" tickFormatter={(value) => `${value / 1000}k`} tickLine={false} />
                                            <Tooltip formatter={salesTooltipFormatter} labelFormatter={(label) => `Day: ${label}`} />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                dot={{ stroke: '#1d4ed8', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                        Total 7-Day Revenue
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-blue-900">{formatCurrency(totalSalesInChart)}</p>
                                    <p className="text-xs text-blue-600">All recorded sales across the selected window.</p>
                                </div>
                                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Best Day</p>
                                    <p className="mt-2 text-2xl font-bold text-blue-900">{bestSalesDay.label}</p>
                                    <p className="text-xs text-blue-600">{formatCurrency(bestSalesDay.amount)} in revenue.</p>
                                </div>
                                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                                        Average Daily Sales
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-blue-900">
                                        {formatCurrency(salesChart.length ? Math.round(totalSalesInChart / salesChart.length) : 0)}
                                    </p>
                                    <p className="text-xs text-blue-600">Based on the most recent seven days.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
                                <div className="h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={transactionsChart}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                                            <XAxis dataKey="label" stroke="#047857" tickLine={false} />
                                            <YAxis stroke="#047857" allowDecimals={false} tickLine={false} />
                                            <Tooltip formatter={transactionsTooltipFormatter} labelFormatter={(label) => `Day: ${label}`} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                        Total Transactions
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-900">{formatNumber(totalTransactionsInChart)}</p>
                                    <p className="text-xs text-emerald-600">Combined activity across the last seven days.</p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Peak Day</p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-900">{busiestTransactionsDay.label}</p>
                                    <p className="text-xs text-emerald-600">
                                        {formatNumber(busiestTransactionsDay.count)} transactions recorded.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                        Average Daily Volume
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-900">{formatNumber(averageTransactions)}</p>
                                    <p className="text-xs text-emerald-600">Per-day average based on the selected range.</p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                        Most Recent Day
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-900">{formatNumber(latestTransactionsCount)}</p>
                                    <p className="text-xs text-emerald-600">The latest day measured in this range.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Line */}
                    {chartView === 'rental' && <div className="mt-8 border-t-2 border-black"></div>}

                    <style>{`
                        @keyframes slideUp {
                            from {
                                opacity: 0;
                                transform: translateY(40px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `}</style>
                </div>

                {/* Daily Sales */}
                <div className={`bg-white rounded-xl shadow-lg p-6 ${chartVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Daily Sales</h2>
                        <p className="text-sm text-gray-500">Today's sales performance</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Total Sales</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ₱{dailySales.total.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {dailySales.count}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
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

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmConfig.onConfirm();
                    setShowConfirmModal(false);
                }}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />

            {/* Prompt Modal */}
            <PromptModal
                isOpen={showPromptModal}
                onClose={() => setShowPromptModal(false)}
                onConfirm={(value) => {
                    promptConfig.onConfirm(value);
                    setShowPromptModal(false);
                }}
                title={promptConfig.title}
                message={promptConfig.message}
                placeholder={promptConfig.placeholder}
                type={promptConfig.type}
            />
        </AppLayout>
    );
}
