import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Eye, Edit, Package, CheckCircle, Clock, AlertCircle, Truck, Building2, Calendar, DollarSign, Download, Filter, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddPurchaseOrderDialog from '@/components/add-purchase-order-dialog';
import ViewPurchaseOrderDialog from '@/components/view-purchase-order-dialog';
import EditPurchaseOrderDialog from '@/components/edit-purchase-order-dialog';
import PartialReceiveDialog from '@/components/partial-receive-dialog';
import MarkReceivedDialog from '@/components/mark-received-dialog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import ConfirmModal from '@/components/confirm-modal';

// Fade-in-up animation styles
const fadeInSection = {
    opacity: 0,
    transform: 'translateY(20px)',
    animation: 'fadeInUp 0.6s ease-out forwards'
};

const fadeInSectionDelay = (delay: number) => ({
    opacity: 0,
    transform: 'translateY(20px)',
    animation: `fadeInUp 0.6s ease-out ${delay}s forwards`
});

const fadeInUpStyle = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

interface PurchaseOrderItem {
    id: number;
    product_name: string;
    quantity: number;
    received_quantity: number;
    price: number;
    total: number;
}

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_name: string;
    supplier_id: number;
    order_date: string;
    expected_delivery_date: string;
    total_amount: number;
    status: 'pending' | 'partial_received' | 'received' | 'cancelled';
    payment_method?: string;
    payment_status?: string;
    items_count: number;
    received_count: number;
    created_at: string;
    updated_at?: string;
    notes?: string;
    items?: PurchaseOrderItem[];
}

interface SupplierProduct {
    id: number;
    supplier_id: number;
    product_name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    unit: string;
    is_active: boolean;
}

interface Supplier {
    id: number;
    name: string;
    products: SupplierProduct[];
}

interface PurchaseOrderPageProps {
    purchaseOrders: PurchaseOrder[];
    success?: string;
    breadcrumbs?: BreadcrumbItem[];
    suppliers?: Supplier[];
    nextPoNumber?: string;
}

export default function PurchaseOrder({ purchaseOrders: initialPurchaseOrders = [], breadcrumbs = [], success, suppliers = [], nextPoNumber }: PurchaseOrderPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial_received' | 'received' | 'cancelled'>('all');
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showPartialReceiveDialog, setShowPartialReceiveDialog] = useState(false);
    const [partialReceiveOrder, setPartialReceiveOrder] = useState<PurchaseOrder | null>(null);
    const [showMarkReceivedDialog, setShowMarkReceivedDialog] = useState(false);
    const [markReceivedOrder, setMarkReceivedOrder] = useState<PurchaseOrder | null>(null);
    const itemsPerPage = 10;

    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
    });

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirmModal(true);
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
    
    // Handle case where purchaseOrders might be undefined or null
    const purchaseOrders = Array.isArray(initialPurchaseOrders) ? initialPurchaseOrders : [];
    
    const filteredPurchaseOrders = purchaseOrders.filter(po => {
        const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPurchaseOrders = filteredPurchaseOrders.length;
    const totalPages = Math.ceil(totalPurchaseOrders / itemsPerPage);
    const [currentPage, setCurrentPage] = useState(1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPurchaseOrders = filteredPurchaseOrders.slice(startIndex, endIndex);

    const handleMarkReceived = (po: PurchaseOrder) => {
        setMarkReceivedOrder(po);
        setShowMarkReceivedDialog(true);
    };

    const handleCancelOrder = (po: PurchaseOrder) => {
        showConfirm(
            'Cancel Purchase Order',
            `Are you sure you want to cancel purchase order ${po.po_number}? This action cannot be undone.`,
            () => {
                router.post(`/purchase-order/${po.id}/cancel`, {}, {
                    preserveScroll: true,
                });
            },
            'danger'
        );
    };

    const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length;
    const partialReceivedOrders = purchaseOrders.filter(po => po.status === 'partial_received').length;
    const receivedOrders = purchaseOrders.filter(po => po.status === 'received').length;
    const cancelledOrders = purchaseOrders.filter(po => po.status === 'cancelled').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'partial_received':
                return <Badge className="bg-blue-100 text-blue-800">Partial Received</Badge>;
            case 'received':
                return <Badge className="bg-green-100 text-green-800">Received</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Purchase Order Management" />
            <style>{fadeInUpStyle}</style>
            
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground" style={fadeInSectionDelay(0.05)}>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Success Alert */}
                {showSuccess && success && (
                    <Alert className="bg-green-50 border-green-200 text-green-800" style={fadeInSectionDelay(0.1)}>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {success}
                        </AlertDescription>
                    </Alert>
                )}
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={fadeInSectionDelay(0.15)}>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Purchase Order Management</h1>
                        <p className="text-muted-foreground">
                            Manage supplier orders and track delivery status
                        </p>
                    </div>
                    <Button 
                        onClick={() => setShowAddDialog(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Purchase Order
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Orders Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 transition-all hover:shadow-xl" style={fadeInSectionDelay(0.1)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{purchaseOrders.length}</p>
                                <p className="text-xs text-muted-foreground">
                                    All purchase orders
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 transition-all hover:shadow-xl" style={fadeInSectionDelay(0.2)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting delivery
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Partial Received Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transition-all hover:shadow-xl" style={fadeInSectionDelay(0.3)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Partial Received</p>
                                <p className="text-2xl font-bold text-blue-600">{partialReceivedOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    Partially delivered
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Received Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transition-all hover:shadow-xl" style={fadeInSectionDelay(0.4)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Received</p>
                                <p className="text-2xl font-bold text-green-600">{receivedOrders}</p>
                                <p className="text-xs text-muted-foreground">
                                    Fully delivered
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <Card style={fadeInSectionDelay(0.5)}>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <CardTitle>Purchase Orders</CardTitle>
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Filter className="h-4 w-4" />
                                                {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ').charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'pending' | 'partial_received' | 'received' | 'cancelled')}>
                                                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="partial_received">Partial Received</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="received">Received</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            
                            <div className="relative w-full sm:w-64 mt-4">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search purchase orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Expected Delivery</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentPurchaseOrders.map((po) => (
                                        <TableRow key={po.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{po.po_number}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{po.supplier_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                    <span>{new Date(po.expected_delivery_date).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{formatCurrency(po.total_amount)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(po.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full" 
                                                            style={{ width: `${(po.received_count / po.items_count) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {po.received_count}/{po.items_count}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPurchaseOrder(po);
                                                            setShowViewDialog(true);
                                                        }}
                                                        title="View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <EditPurchaseOrderDialog 
                                                        purchaseOrder={po} 
                                                        onSuccess={() => router.visit('/purchase-order')} 
                                                    />
                                                    {(po.status === 'pending' || po.status === 'partial_received') && (po.items_count - po.received_count) > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPartialReceiveOrder(po);
                                                                setShowPartialReceiveDialog(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            title="Partial Receive"
                                                        >
                                                            <Package className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {(po.status === 'pending' || po.status === 'partial_received') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkReceived(po)}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            title="Mark as Fully Received"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {po.status === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancelOrder(po)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            title="Cancel Order"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {currentPurchaseOrders.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {purchaseOrders.length === 0 
                                    ? "No purchase orders found. Click 'New Purchase Order' to get started." 
                                    : "No purchase orders found matching your search."
                                }
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, totalPurchaseOrders)} of {totalPurchaseOrders} purchase orders
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View Purchase Order Dialog */}
            {selectedPurchaseOrder && (
                <ViewPurchaseOrderDialog
                    purchaseOrder={selectedPurchaseOrder}
                    open={showViewDialog}
                    onOpenChange={(open) => {
                        setShowViewDialog(open);
                        if (!open) {
                            setSelectedPurchaseOrder(null);
                        }
                    }}
                />
            )}

            {/* Add Purchase Order Dialog */}
            <AddPurchaseOrderDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => router.visit('/purchase-order')}
                suppliers={suppliers || []}
                nextPoNumber={nextPoNumber}
            />

            {/* Partial Receive Dialog */}
            <PartialReceiveDialog
                purchaseOrder={partialReceiveOrder}
                open={showPartialReceiveDialog}
                onOpenChange={(open) => {
                    setShowPartialReceiveDialog(open);
                    if (!open) {
                        setPartialReceiveOrder(null);
                    }
                }}
            />

            {/* Mark Received Dialog */}
            <MarkReceivedDialog
                purchaseOrder={markReceivedOrder}
                open={showMarkReceivedDialog}
                onOpenChange={(open) => {
                    setShowMarkReceivedDialog(open);
                    if (!open) {
                        setMarkReceivedOrder(null);
                    }
                }}
            />

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
        </AppLayout>
    );
}
