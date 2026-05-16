import { Head } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Receipt, 
    Search, 
    Calendar,
    DollarSign,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

interface Sale {
    id: number;
    customer_name: string;
    total_amount: number;
    payment_method: string;
    items: Array<{
        tank_type: string;
        quantity: number;
        price: number;
    }>;
    created_at: string;
    user: {
        name: string;
    };
}

interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

interface SalesHistoryProps {
    sales: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLinks;
    };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function SalesHistory({ sales, auth }: SalesHistoryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(sales.current_page);

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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        
        const params = new URLSearchParams(window.location.search);
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        
        router.get(`/cashier/sales-history?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        
        const params = new URLSearchParams(window.location.search);
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        params.set('page', page.toString());
        
        router.get(`/cashier/sales-history?${params.toString()}`);
    };

    const getPaymentMethodBadge = (method: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            cash: 'default',
            gcash: 'secondary',
            card: 'outline'
        };
        
        return (
            <Badge variant={variants[method] || 'outline'} className="capitalize">
                {method}
            </Badge>
        );
    };

    return (
        <CashierLayout>
            <Head title="Sales History" />
            
            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center justify-between space-y-2">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = '/cashier/dashboard'}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
                            <p className="text-muted-foreground">
                                View and manage your sales records
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => window.location.href = '/cashier'}
                        className="flex items-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        New Sale
                    </Button>
                </div>

                {/* Search and Stats */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search Sales
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Total Sales: {sales.total}</span>
                                <span>Total Revenue: {formatCurrency(sales.data.reduce((sum, sale) => sum + sale.total_amount, 0))}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by customer name or receipt number..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Sales Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sales.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No sales found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery ? 'Try adjusting your search terms' : 'Start making sales to see them here'}
                                </p>
                                {searchQuery && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleSearch('')}
                                    >
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sales.data.map((sale) => (
                                    <div key={sale.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold">{sale.customer_name}</h3>
                                                    <Badge variant="outline">#{sale.id}</Badge>
                                                    {getPaymentMethodBadge(sale.payment_method)}
                                                </div>
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(sale.created_at)}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {sale.items.map((item, index) => (
                                                        <div key={index} className="text-sm text-muted-foreground">
                                                            {item.quantity}x {item.tank_type} @ {formatCurrency(item.price)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">
                                                    {formatCurrency(sale.total_amount)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {sales.last_page > 1 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((sales.current_page - 1) * sales.per_page) + 1} to {Math.min(sales.current_page * sales.per_page, sales.total)} of {sales.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(sales.current_page - 1)}
                                        disabled={sales.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, sales.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (sales.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (sales.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (sales.current_page >= sales.last_page - 2) {
                                                pageNum = sales.last_page - 4 + i;
                                            } else {
                                                pageNum = sales.current_page - 2 + i;
                                            }
                                            
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={pageNum === sales.current_page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(sales.current_page + 1)}
                                        disabled={sales.current_page === sales.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CashierLayout>
    );
}
