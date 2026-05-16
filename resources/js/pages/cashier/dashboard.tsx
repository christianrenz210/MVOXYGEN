import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import CashierLayout from '@/layouts/cashier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    DollarSign, 
    ShoppingCart, 
    Package, 
    TrendingUp,
    Users,
    FileText,
    Receipt
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Tank {
    id: number;
    tank_type: string;
    quantity: number;
    price: number;
    status: string;
}

interface CashierDashboardProps {
    stats: {
        today: { total: number; count: number };
        week: { total: number; count: number };
        month: { total: number; count: number };
    };
    availableTanks: Tank[];
    salesChartData: Array<{ date: string; sales: number }>;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function CashierDashboard({ 
    stats, 
    availableTanks, 
    salesChartData,
    auth 
}: CashierDashboardProps) {
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />
            
            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Cashier Dashboard</h2>
                        <p className="text-muted-foreground">
                            Welcome back, {auth.user.name}! Here's your sales overview.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            onClick={() => window.location.href = '/cashier'}
                            className="flex items-center gap-2"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            New Sale
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/cashier/sales-history'}
                            className="flex items-center gap-2"
                        >
                            <Receipt className="h-4 w-4" />
                            Sales History
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/cashier/audit-trail'}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Audit Trail
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                            <span className="font-bold text-muted-foreground">₱</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.today.total)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.today.count} transactions
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.week.total)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.week.count} transactions
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.month.total)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.month.count} transactions
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Tanks</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{availableTanks.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Total available
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={salesChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value: number) => [formatCurrency(value), 'Sales']}
                                        labelStyle={{ color: '#000' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#2563eb" 
                                        strokeWidth={2}
                                        dot={{ fill: '#2563eb' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CashierLayout>
    );
}
