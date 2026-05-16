import { Head } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    FileText, 
    Search, 
    Filter,
    Calendar,
    User,
    DollarSign,
    Shield,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

interface Sale {
    id: number;
    customer_name: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    user: {
        name: string;
    };
    gcash_reference?: string;
    customer_phone?: string;
    payment_time?: string;
}

interface AuditTrailProps {
    sales: Sale[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function AuditTrail({ sales, auth }: AuditTrailProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');

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

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter sales based on search and payment method
    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sale.id.toString().includes(searchQuery);
        const matchesMethod = filterMethod === 'all' || sale.payment_method === filterMethod;
        return matchesSearch && matchesMethod;
    });

    // Get only GCash payments for detailed audit
    const gcashSales = filteredSales.filter(sale => sale.payment_method === 'gcash');

    return (
        <CashierLayout>
            <Head title="Audit Trail" />
            
            <div className="flex-1 space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
                        <p className="text-muted-foreground">
                            Complete payment verification records and security audit trail
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/cashier/dashboard'}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

                {/* Security Info */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-blue-800">🔒 Security Verification System</h3>
                                <p className="text-sm text-blue-600">
                                    All GCash payments require complete verification including reference number, customer phone number, and payment time before processing.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by customer name or sale ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Payment Method</label>
                                <select
                                    value={filterMethod}
                                    onChange={(e) => setFilterMethod(e.target.value)}
                                    className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="all">All Methods</option>
                                    <option value="gcash">GCash Only</option>
                                    <option value="cash">Cash Only</option>
                                    <option value="card">Card Only</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total GCash Payments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{gcashSales.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(gcashSales.reduce((sum, sale) => sum + sale.total_amount, 0))} total
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's GCash</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {gcashSales.filter(sale => {
                                    const today = new Date().toDateString();
                                    return new Date(sale.created_at).toDateString() === today;
                                }).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Verified payments today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">All Transactions</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{filteredSales.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Total filtered transactions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* GCash Audit Trail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            GCash Payment Audit Trail
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {gcashSales.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No GCash payments found</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        GCash payments will appear here once processed with complete verification
                                    </p>
                                </div>
                            ) : (
                                gcashSales.map((sale) => (
                                    <div key={sale.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-lg">{sale.customer_name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(sale.created_at)} at {formatTime(sale.created_at)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">{formatCurrency(sale.total_amount)}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    #{sale.id}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded p-3 space-y-2">
                                                <h4 className="font-medium text-sm flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    Payment Details
                                                </h4>
                                                <div className="space-y-1 text-xs">
                                                    <p><strong>Method:</strong> <span className="text-green-600">GCash</span></p>
                                                    <p><strong>Amount:</strong> {formatCurrency(sale.total_amount)}</p>
                                                    <p><strong>Status:</strong> <span className="text-green-600">✓ Verified & Complete</span></p>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-blue-50 rounded p-3 space-y-2">
                                                <h4 className="font-medium text-sm flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Processing Info
                                                </h4>
                                                <div className="space-y-1 text-xs">
                                                    <p><strong>Cashier:</strong> {sale.user.name}</p>
                                                    <p><strong>Reference:</strong> {sale.gcash_reference || 'N/A'}</p>
                                                    <p><strong>Phone:</strong> {sale.customer_phone || 'N/A'}</p>
                                                    <p><strong>Time:</strong> {sale.payment_time || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CashierLayout>
    );
}
