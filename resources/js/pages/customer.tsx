import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Phone, MapPin, Eye, Edit, Archive, RotateCcw, CheckCircle, ChevronLeft, ChevronRight, Filter, Users, AlertCircle, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddCustomerDialog from '@/components/add-customer-dialog';
import EditCustomerDialog from '@/components/edit-customer-dialog';
import ArchiveCustomerDialog from '@/components/archive-customer-dialog';
import RestoreCustomerDialog from '@/components/restore-customer-dialog';
import DeleteCustomerDialog from '@/components/delete-customer-dialog';
import ViewCustomerDialog from '@/components/view-customer-dialog';
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
    delivery_address?: string;
    status: 'active' | 'inactive' | 'archived';
    total_rentals: number;
    created_at: string;
    updated_at?: string;
    recent_transactions?: Transaction[];
    profile_image?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        role?: string;
        profile_image?: string;
        status?: string;
        updated_at?: string;
    };
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
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [customerPage, setCustomerPage] = useState(1);
    const [transactionPage, setTransactionPage] = useState(1);
    const itemsPerPage = 10;

    const handleViewCustomer = async (customer: Customer) => {
        try {
            const response = await fetch(`/customer/${customer.id}/edit`);
            const data = await response.json();
            setSelectedCustomer(data);
            setShowViewDialog(true);
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
            setSelectedCustomer(customer);
            setShowViewDialog(true);
        }
    };

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
    
    // Function to mask contact number (show only first 2 digits)
    const maskContactNumber = (contact: string) => {
        if (!contact || contact.length < 2) return contact;
        const firstTwo = contact.slice(0, 2);
        const masked = '*'.repeat(contact.length - 2);
        return firstTwo + masked;
    };

    // Function to mask address (show only first word/area)
    const maskAddress = (address: string) => {
        if (!address || address.length < 5) return address;
        // Don't mask "Pickup at Store" addresses
        if (address.toLowerCase().includes('pickup at store')) return address;
        const words = address.split(' ');
        if (words.length === 0) return address;
        // Show first word and mask the rest
        const firstWord = words[0];
        const restLength = address.length - firstWord.length;
        const masked = '*'.repeat(restLength);
        return firstWord + masked;
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.contact_number.includes(searchTerm) ||
            customer.address.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination for customers
    const totalCustomers = filteredCustomers.length;
    const totalPages = Math.ceil(totalCustomers / itemsPerPage);
    const startIndex = (customerPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    // Pagination for transactions
    const totalTransactions = recentTransactions.length;
    const totalTransactionPages = Math.ceil(totalTransactions / itemsPerPage);
    const transactionStartIndex = (transactionPage - 1) * itemsPerPage;
    const transactionEndIndex = transactionStartIndex + itemsPerPage;
    const currentTransactions = recentTransactions.slice(transactionStartIndex, transactionEndIndex);

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInUp">
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
                    {/* Total Customers Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 transition-all hover:shadow-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Customers</p>
                                <p className="text-2xl font-bold text-gray-800">{initialCustomers.length}</p>
                                <p className="text-xs text-muted-foreground">
                                    Registered customers
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Active Customers Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transition-all hover:shadow-xl animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Customers</p>
                                <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Inactive Customers Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 transition-all hover:shadow-xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Inactive Customers</p>
                                <p className="text-2xl font-bold text-red-600">{inactiveCustomers}</p>
                                <p className="text-xs text-muted-foreground">
                                    Currently inactive
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Rentals Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transition-all hover:shadow-xl animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Rentals</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {initialCustomers.reduce((sum, c) => sum + c.total_rentals, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    All-time rentals
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <Card className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
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
                            
                            {/* Customer Directory Header Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1} to {Math.min(endIndex, totalCustomers)} of {totalCustomers} customers
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCustomerPage(customerPage - 1)}
                                            disabled={customerPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === customerPage ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCustomerPage(page)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCustomerPage(customerPage + 1)}
                                            disabled={customerPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
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
                                        <TableHead>Profile</TableHead>
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
                                    {currentCustomers.map((customer) => (
                                        <TableRow key={customer.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {customer.profile_image || customer.user?.profile_image ? (
                                                        <img 
                                                            src={`/storage/${customer.profile_image || customer.user?.profile_image}?v=${Date.now()}`} 
                                                            alt={customer.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder-avatar.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-sm font-medium">
                                                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="text-sm text-muted-foreground">ID: #{customer.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-mono">{maskContactNumber(customer.contact_number)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 max-w-[200px]">
                                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="truncate font-mono">
                                                        {maskAddress(customer.delivery_address || customer.address)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                                                    className={
                                                        customer.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                                        customer.status === 'inactive' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
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
                                                        onClick={() => handleViewCustomer(customer)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <EditCustomerDialog 
                                                        customer={customer} 
                                                        onSuccess={() => router.visit('/customer')} 
                                                    />
                                                    {customer.status === 'archived' ? (
                                                        <>
                                                            <RestoreCustomerDialog 
                                                                customer={customer} 
                                                                onSuccess={() => router.visit('/customer')} 
                                                            />
                                                            <DeleteCustomerDialog 
                                                                customer={customer} 
                                                                onSuccess={() => router.visit('/customer')} 
                                                            />
                                                        </>
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
                        
                        {/* Customer Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalCustomers)} of {totalCustomers} customers
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCustomerPage(customerPage - 1)}
                                        disabled={customerPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === customerPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCustomerPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCustomerPage(customerPage + 1)}
                                        disabled={customerPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
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
                                        {currentTransactions && currentTransactions.length > 0 ? (
                                            currentTransactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">{transaction.customer_name}</TableCell>
                                                    <TableCell>
                                                        {transaction.tank_id && transaction.tank_id !== '-' && transaction.tank_id.trim() !== '' ? (
                                                            <span className="text-blue-600 font-medium">{transaction.tank_id}</span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Not Assigned</span>
                                                        )}
                                                    </TableCell>
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
                                
                                {/* Transaction Pagination */}
                                {totalTransactionPages > 1 && (
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {transactionStartIndex + 1} to {Math.min(transactionEndIndex, totalTransactions)} of {totalTransactions} transactions
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTransactionPage(transactionPage - 1)}
                                                disabled={transactionPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: totalTransactionPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={page === transactionPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setTransactionPage(page)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTransactionPage(transactionPage + 1)}
                                                disabled={transactionPage === totalTransactionPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                </div>
            </div>

            {/* View Customer Dialog */}
            {selectedCustomer && (
                <ViewCustomerDialog
                    customer={selectedCustomer}
                    open={showViewDialog}
                    onOpenChange={(open) => {
                        setShowViewDialog(open);
                        if (!open) {
                            setSelectedCustomer(null);
                        }
                    }}
                />
            )}
        </AppLayout>
    );
}
