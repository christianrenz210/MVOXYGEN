import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Package, RefreshCw, Clock, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import AlertModal from '@/components/alert-modal';

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
    tableData: Array<{
        period: string;
        full_date?: string;
        type: string;
        customer_name: string;
        amount: number;
        tank_type: string;
    }>;
    totalRentals: number;
    totalSales: number;
    currentPeriodRentals: number;
    currentPeriodSales: number;
    cylinderDistribution: CylinderData[];
    currentPeriod: 'daily' | 'weekly' | 'monthly';
    comparisonData?: any;
    compareMode: 'none' | 'today' | 'custom' | 'last30';
    comparisonChartData?: ChartData[];
}

export default function Reports({ 
    chartData, 
    tableData,
    totalRentals, 
    totalSales,
    currentPeriodRentals,
    currentPeriodSales,
    cylinderDistribution,
    currentPeriod,
    comparisonData,
    compareMode,
    comparisonChartData
}: Props) {
    const [currentChart, setCurrentChart] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const itemsPerPage = 10;

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(value);
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) {
            showAlert('Error', 'No data available to export', 'error');
            return;
        }

        // Convert data to CSV format
        const csvContent = convertToCSV(data);
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    };

    const convertToCSV = (data: any[]): string => {
        if (data.length === 0) return '';
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Handle values that might contain commas or quotes
                    const escapedValue = typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                        ? `"${value.replace(/"/g, '""')}"` 
                        : value;
                    return escapedValue;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    };

    const exportRefillsData = () => {
        const refillsData = tableData
            .filter(item => item.type === 'refill')
            .map(item => ({
                'Period/Date': currentPeriod === 'monthly' ? item.full_date : item.period,
                'Customer Name': item.customer_name,
                'Tank Type': item.tank_type,
                'Refills': item.amount || 0
            }));
        
        exportToCSV(refillsData, `refills_report_${currentPeriod}_${new Date().toISOString().split('T')[0]}`);
    };

    const exportRentalsData = () => {
        const rentalsData = tableData
            .filter(item => item.type === 'rental')
            .map(item => ({
                'Period/Date': currentPeriod === 'monthly' ? item.full_date : item.period,
                'Customer Name': item.customer_name,
                'Tank Type': item.tank_type,
                'Amount': formatCurrency(item.amount)
            }));
        
        exportToCSV(rentalsData, `rentals_report_${currentPeriod}_${new Date().toISOString().split('T')[0]}`);
    };

    const exportSalesData = () => {
        const salesData = tableData
            .filter(item => item.type === 'sale')
            .map(item => ({
                'Date': currentPeriod === 'monthly' ? item.full_date : item.period,
                'Customer Name': item.customer_name,
                'Tank Type': item.tank_type,
                'Amount': formatCurrency(item.amount)
            }));
        
        exportToCSV(salesData, `sales_report_${currentPeriod}_${new Date().toISOString().split('T')[0]}`);
    };

    const exportCylindersData = () => {
        exportToCSV(cylinderDistribution.map(item => ({
            'Tank Type': item.name,
            'Quantity': item.quantity,
            'Color': item.color
        })), `cylinder_distribution_${new Date().toISOString().split('T')[0]}`);
    };

    const totalCylinders = cylinderDistribution.reduce((sum, item) => sum + item.quantity, 0);

    const charts = [
        {
            id: 'refills',
            title: `${currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Refills`,
            component: (
                <div>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={compareMode !== 'none' && comparisonChartData ? comparisonChartData : chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <div className="mt-6 flex flex-col items-center">
                        <div className="overflow-x-auto w-full max-w-4xl">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                            {currentPeriod === 'monthly' ? 'Date' : 'Period'}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Customer Name</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData
                                        .filter(item => item.type === 'refill')
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3 px-4 text-gray-800 text-center">
                                                    {currentPeriod === 'monthly' ? item.full_date : item.period}
                                                </td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.customer_name}</td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.tank_type}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {Math.ceil(tableData.filter(item => item.type === 'refill').length / itemsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(tableData.filter(item => item.type === 'refill').length / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(tableData.filter(item => item.type === 'refill').length / itemsPerPage)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={exportRefillsData}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Refills
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'rentals',
            title: `${currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Rentals`,
            component: (
                <div>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={compareMode !== 'none' && comparisonChartData ? comparisonChartData : chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <div className="mt-6 flex flex-col items-center">
                        <div className="overflow-x-auto w-full max-w-4xl">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                            {currentPeriod === 'monthly' ? 'Date' : 'Period'}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Customer Name</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData
                                        .filter(item => item.type === 'rental')
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3 px-4 text-gray-800 text-center">
                                                    {currentPeriod === 'monthly' ? item.full_date : item.period}
                                                </td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.customer_name}</td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.tank_type}</td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {Math.ceil(tableData.filter(item => item.type === 'rental').length / itemsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(tableData.filter(item => item.type === 'rental').length / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(tableData.filter(item => item.type === 'rental').length / itemsPerPage)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={exportRentalsData}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Rentals
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'sales',
            title: `${currentPeriod === 'daily' ? 'Daily' : currentPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Sales`,
            component: (
                <div>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={compareMode !== 'none' && comparisonChartData ? comparisonChartData : chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    <div className="mt-6 flex flex-col items-center">
                        <div className="overflow-x-auto w-full max-w-4xl">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                            {currentPeriod === 'monthly' ? 'Date' : 'Period'}
                                        </th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Customer Name</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData
                                        .filter(item => item.type === 'sale')
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3 px-4 text-gray-800 text-center">
                                                    {currentPeriod === 'monthly' ? item.full_date : item.period}
                                                </td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.customer_name}</td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{item.tank_type}</td>
                                                <td className="py-3 px-4 text-gray-800 text-center">{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {Math.ceil(tableData.filter(item => item.type === 'sale').length / itemsPerPage)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(tableData.filter(item => item.type === 'sale').length / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(tableData.filter(item => item.type === 'sale').length / itemsPerPage)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={exportSalesData}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Sales
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'cylinders',
            title: 'Gas Cylinder Distribution',
            component: (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={360}>
                                <PieChart>
                                    <Pie
                                        data={cylinderDistribution}
                                        dataKey="quantity"
                                        nameKey="name"
                                        innerRadius={70}
                                        outerRadius={130}
                                        paddingAngle={4}
                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {cylinderDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, _name, payload) => [`${value} units`, payload?.payload?.name ?? 'Tank Type']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Cylinders Tracked</p>
                                <p className="mt-1 text-3xl font-bold text-gray-900">{totalCylinders.toLocaleString()}</p>
                                <p className="mt-1 text-xs text-gray-500">Breakdown by tank type shown in the chart.</p>
                            </div>
                            <div className="space-y-3">
                                {cylinderDistribution.map((item, index) => {
                                    const percent = totalCylinders > 0 ? (item.quantity / totalCylinders) * 100 : 0;
                                    return (
                                        <div key={index} className="rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{item.quantity.toLocaleString()} units</span>
                                            </div>
                                            <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                                                ></div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">{percent.toFixed(1)}% of total inventory</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Inventory Notes</h3>
                            <p className="text-xs text-gray-500">Track cylinder mix and spot potential shortages before they impact fulfillment.</p>
                        </div>
                        <div className="flex w-full justify-end">
                            <button
                                onClick={exportCylindersData}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                            >
                                <Download className="h-4 w-4" />
                                Export Cylinders
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const nextChart = () => {
        setCurrentChart((prev: number) => (prev + 1) % charts.length);
        setCurrentPage(1);
    };

    const prevChart = () => {
        setCurrentChart((prev: number) => (prev - 1 + charts.length) % charts.length);
        setCurrentPage(1);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/reports' }
    ];

    return (
        <AppLayout>
            <Head title="Reports" />
            <div className="min-h-screen bg-gray-50 p-6 w-full max-w-none">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Rental Reports</h1>
                    <p className="text-gray-600">View rental statistics and sales performance</p>
                </div>

                {/* Period Filter */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">Reports Dashboard</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.get('/reports', { period: 'daily' })}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentPeriod === 'daily' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => router.get('/reports', { period: 'weekly' })}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentPeriod === 'weekly' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => router.get('/reports', { period: 'monthly' })}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentPeriod === 'monthly' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                </div>

                {/* Date Comparison Controls */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Compare:</span>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => router.get('/reports', { period: currentPeriod, compare: 'none' })}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        compareMode === 'none' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    None
                                </button>
                                <button
                                    onClick={() => router.get('/reports', { period: currentPeriod, compare: 'today' })}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        compareMode === 'today' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Today vs Yesterday
                                </button>
                                <button
                                    onClick={() => router.get('/reports', { period: currentPeriod, compare: 'last30' })}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        compareMode === 'last30' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    onClick={() => {
                                        if (customStartDate && customEndDate) {
                                            router.get('/reports', { period: currentPeriod, compare: 'custom', start_date: customStartDate, end_date: customEndDate });
                                        } else {
                                            showAlert('Error', 'Please select both start and end dates', 'warning');
                                        }
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                        compareMode === 'custom' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Custom Range
                                </button>
                            </div>
                        </div>
                        
                        {compareMode === 'custom' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Start date"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="End date"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Comparison Results Display */}
                {compareMode !== 'none' && comparisonData && (
                    <div className="bg-blue-50 rounded-lg shadow p-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Comparison Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {compareMode === 'today' && (
                                <>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Today</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.today.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.today.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.today.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Yesterday</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.yesterday.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.yesterday.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.yesterday.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Change</p>
                                        <p className={`text-2xl font-bold ${comparisonData.percentChanges.rentals >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.rentals >= 0 ? '+' : ''}{comparisonData.percentChanges.rentals.toFixed(1)}% rentals
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.sales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.sales >= 0 ? '+' : ''}{comparisonData.percentChanges.sales.toFixed(1)}% sales
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.refills >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.refills >= 0 ? '+' : ''}{comparisonData.percentChanges.refills.toFixed(1)}% refills
                                        </p>
                                    </div>
                                </>
                            )}
                            {compareMode === 'last30' && (
                                <>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Last 30 Days</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.last30Days.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.last30Days.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.last30Days.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Previous 30 Days</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.previous30Days.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.previous30Days.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.previous30Days.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Change</p>
                                        <p className={`text-2xl font-bold ${comparisonData.percentChanges.rentals >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.rentals >= 0 ? '+' : ''}{comparisonData.percentChanges.rentals.toFixed(1)}% rentals
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.sales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.sales >= 0 ? '+' : ''}{comparisonData.percentChanges.sales.toFixed(1)}% sales
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.refills >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.refills >= 0 ? '+' : ''}{comparisonData.percentChanges.refills.toFixed(1)}% refills
                                        </p>
                                    </div>
                                </>
                            )}
                            {compareMode === 'custom' && comparisonData.custom && (
                                <>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Custom Range</p>
                                        <p className="text-xs text-gray-500">{comparisonData.custom.startDate} to {comparisonData.custom.endDate}</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.custom.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.custom.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.custom.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Previous Period</p>
                                        <p className="text-xs text-gray-500">{comparisonData.previous.startDate} to {comparisonData.previous.endDate}</p>
                                        <p className="text-2xl font-bold text-gray-800">{comparisonData.previous.rentals} rentals</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(comparisonData.previous.sales)} sales</p>
                                        <p className="text-sm text-gray-600">{comparisonData.previous.refills} refills</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Change</p>
                                        <p className={`text-2xl font-bold ${comparisonData.percentChanges.rentals >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.rentals >= 0 ? '+' : ''}{comparisonData.percentChanges.rentals.toFixed(1)}% rentals
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.sales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.sales >= 0 ? '+' : ''}{comparisonData.percentChanges.sales.toFixed(1)}% sales
                                        </p>
                                        <p className={`text-sm ${comparisonData.percentChanges.refills >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparisonData.percentChanges.refills >= 0 ? '+' : ''}{comparisonData.percentChanges.refills.toFixed(1)}% refills
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Cards - Dynamic based on current chart */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {currentChart === 0 && (
                        // Refills Statistics
                        <>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Total Refills</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {tableData.filter(item => item.type === 'refill').length}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Refills
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {tableData.filter(item => item.type === 'refill' && 
                                        (currentPeriod === 'daily' ? item.period === new Date().toLocaleDateString('en-US', { weekday: 'short' }) :
                                         currentPeriod === 'weekly' ? item.period.startsWith('Week') :
                                         true)).length}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Unique Customers</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {[...new Set(tableData.filter(item => item.type === 'refill').map(item => item.customer_name))].length}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Most Common Tank</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {(() => {
                                        const tankCounts: Record<string, number> = {};
                                        tableData.filter(item => item.type === 'refill').forEach(item => {
                                            if (item.tank_type && item.tank_type !== 'N/A') {
                                                tankCounts[item.tank_type] = (tankCounts[item.tank_type] || 0) + 1;
                                            }
                                        });
                                        const mostCommon = Object.keys(tankCounts).reduce((a, b) => tankCounts[a] > tankCounts[b] ? a : b, 'N/A');
                                        return mostCommon;
                                    })()}
                                </p>
                            </div>
                        </>
                    )}

                    {currentChart === 1 && (
                        // Rentals Statistics
                        <>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Total Rentals</p>
                                <p className="text-2xl font-bold text-gray-800">{totalRentals}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Rentals
                                </p>
                                <p className="text-2xl font-bold text-gray-800">{currentPeriodRentals}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentPeriodSales)}</p>
                            </div>
                        </>
                    )}

                    {currentChart === 2 && (
                        // Sales Statistics
                        <>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Total Sales</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalSales)}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">
                                    {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : 'This Month'} Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentPeriodSales)}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Average Rental Amount</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(tableData.filter(item => item.type === 'rental' && item.amount > 0).length > 0 
                                        ? tableData.filter(item => item.type === 'rental' && item.amount > 0).reduce((sum, item) => sum + item.amount, 0) / 
                                          tableData.filter(item => item.type === 'rental' && item.amount > 0).length 
                                        : 0)}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Highest Sale</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(Math.max(...tableData.filter(item => item.type === 'rental' && item.amount > 0).map(item => item.amount), 0))}
                                </p>
                            </div>
                        </>
                    )}

                    {currentChart === 3 && (
                        // Cylinder Distribution Statistics
                        <>
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Total Tanks</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {cylinderDistribution.reduce((sum, item) => sum + item.quantity, 0)}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Tank Types</p>
                                <p className="text-2xl font-bold text-gray-800">{cylinderDistribution.length}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Most Available</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {cylinderDistribution.length > 0 ? cylinderDistribution[0].name : 'N/A'}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <p className="text-gray-500 text-sm">Least Available</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {cylinderDistribution.length > 0 ? cylinderDistribution[cylinderDistribution.length - 1].name : 'N/A'}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Charts Section - Single Chart with Navigation */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={prevChart}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            
                            <h2 className="text-xl font-bold text-gray-800">{charts[currentChart].title}</h2>
                            
                            <button
                                onClick={nextChart}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                        
                        {charts[currentChart].component}
                        
                        {/* Chart Indicators */}
                        <div className="flex justify-center gap-2 mt-4">
                            {charts.map((chart, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentChart(index)}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        index === currentChart ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </AppLayout>
    );
}
