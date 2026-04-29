import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Package, RefreshCw, Clock } from 'lucide-react';

interface ChartData {
    label: string;
    rentals: number;
    sales: number;
    refills: number;
}

interface CylinderData {
    name: string;
    quantity: number;
    color: string;
}

interface Props {
    chartData: ChartData[];
    totalRentals: number;
    totalSales: number;
    currentPeriodRentals: number;
    currentPeriodSales: number;
    cylinderDistribution: CylinderData[];
    currentPeriod: 'daily' | 'weekly' | 'monthly';
}

export default function Reports({ 
    chartData, 
    totalRentals, 
    totalSales,
    currentPeriodRentals,
    currentPeriodSales,
    cylinderDistribution,
    currentPeriod
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/reports' }
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <AppLayout>
            <Head title="Reports" />
            <div className="min-h-screen bg-gray-50 p-6 w-full max-w-none">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header with Period Filter */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rental Reports</h1>
                        <p className="text-gray-600">View rental statistics and sales performance</p>
                    </div>
                    
                    {/* Period Filter Buttons */}
                    <div className="flex items-center gap-2 bg-white rounded-lg shadow p-1">
                        <button
                            onClick={() => router.get('/reports', { period: 'daily' }, { preserveState: true })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPeriod === 'daily' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => router.get('/reports', { period: 'weekly' }, { preserveState: true })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPeriod === 'weekly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => router.get('/reports', { period: 'monthly' }, { preserveState: true })}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPeriod === 'monthly' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Rentals</p>
                                <p className="text-2xl font-bold text-gray-800">{totalRentals}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Rentals
                                </p>
                                <p className="text-2xl font-bold text-gray-800">{currentPeriodRentals}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentPeriodSales)}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Refills Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-orange-600" />
                            {currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Refills
                        </h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRefills" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} refills`, 'Refill Requests']} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="refills" 
                                        stroke="#f97316" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRefills)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-600">Number of Refills</span>
                        </div>
                    </div>

                    {/* Rentals Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            {currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Rentals
                        </h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area 
                                        type="monotone" 
                                        dataKey="rentals" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRentals)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Number of Rentals</span>
                        </div>
                    </div>

                    {/* Sales Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            {currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Sales
                        </h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#22c55e" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorSales)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Sales Revenue</span>
                        </div>
                    </div>

                    {/* Gas Cylinder Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            Gas Cylinder Distribution
                        </h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cylinderDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`${value} units`, 'Quantity']}
                                    />
                                    <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                                        {cylinderDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Color Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                            {cylinderDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
