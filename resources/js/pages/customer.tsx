import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Phone, MapPin, Eye, Edit, Archive, RotateCcw, CheckCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddCustomerDialog from '@/components/add-customer-dialog';
import EditCustomerDialog from '@/components/edit-customer-dialog';
import ArchiveCustomerDialog from '@/components/archive-customer-dialog';
import RestoreCustomerDialog from '@/components/restore-customer-dialog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';

interface Transaction {
    id: number;
    customer_id: number;
    customer_name: string;
    tank_id: string;
    transaction_type: 'Rent' | 'Returned' | 'Refill';
    transaction_date: string;
    created_at: string;
}

interface TankDue {
    id: number;
    customer_id: number;
    customer?: {
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
    days_until_return?: number;
    created_at: string;
}

interface Customer {
    id: number;
    name: string;
    contact_number: string;
    address: string;
    status: 'active' | 'inactive' | 'archived';
    total_rentals: number;
    created_at: string;
    updated_at?: string;
    recent_transactions?: Transaction[];
}

interface CustomerPageProps {
    customers: Customer[];
    recent_transactions?: Transaction[];
    success?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function Customer({ customers: initialCustomers = [], recent_transactions: recentTransactions = [], breadcrumbs = [], success }: CustomerPageProps) {
    console.log('Customer component - initialCustomers:', initialCustomers);
    console.log('Customer component - recentTransactions:', recentTransactions);
    console.log('Customer component - success:', success);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');

    // Show success message when it exists
    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            // Hide success message after 10 seconds
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [success]);
    
    // Handle case where customers might be undefined or null
    const customers = Array.isArray(initialCustomers) ? initialCustomers : [];
    
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.contact_number.includes(searchTerm) ||
            customer.address.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;

    
    return (
        <AppLayout>
            <Head title="Customer Management" />
            
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {/* Success Alert */}
                {showSuccess && success && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {success}
                        </AlertDescription>
                    </Alert>
                )}
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
                        <p className="text-muted-foreground">
                            Manage and view all customer information
                        </p>
                    </div>
                    <AddCustomerDialog onSuccess={() => router.visit('/customer')} />
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <div className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{initialCustomers.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered customers
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                            <div className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
                            <div className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{inactiveCustomers}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently inactive
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                            <div className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {initialCustomers.reduce((sum, c) => sum + c.total_rentals, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All-time rentals
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <CardTitle>Customer Directory</CardTitle>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive' | 'archived')}>
                                            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="archived">Archived</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-64 mt-4">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Rentals</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="text-sm text-muted-foreground">ID: #{customer.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{customer.contact_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 max-w-[200px]">
                                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="truncate">{customer.address}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                                                    className={
                                                        customer.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                                        customer.status === 'archived' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                                                        'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }
                                                >
                                                    {customer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{customer.total_rentals}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => router.visit(`/customer/${customer.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <EditCustomerDialog 
                                                        customer={customer} 
                                                        onSuccess={() => router.visit('/customer')} 
                                                    />
                                                    {customer.status === 'archived' ? (
                                                        <RestoreCustomerDialog 
                                                            customer={customer} 
                                                            onSuccess={() => router.visit('/customer')} 
                                                        />
                                                    ) : (
                                                        <ArchiveCustomerDialog 
                                                            customer={customer} 
                                                            onSuccess={() => router.visit('/customer')} 
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {filteredCustomers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {customers.length === 0 
                                    ? "No customers found. Click 'Add Customer' to get started." 
                                    : "No customers found matching your search."
                                }
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6">
                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Tank ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTransactions && recentTransactions.length > 0 ? (
                                            recentTransactions.slice(0, 5).map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">{transaction.customer_name}</TableCell>
                                                    <TableCell>{transaction.tank_id}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                transaction.transaction_type === 'Rent' ? 'default' :
                                                                transaction.transaction_type === 'Returned' ? 'secondary' :
                                                                'outline'
                                                            }
                                                            className={
                                                                transaction.transaction_type === 'Rent' ? 'bg-blue-100 text-blue-800' :
                                                                transaction.transaction_type === 'Returned' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-green-100 text-green-800'
                                                            }
                                                        >
                                                            {transaction.transaction_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No transactions found. Transactions will appear when rental requests are approved or returned.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                </div>
            </div>
        </AppLayout>
    );
}
