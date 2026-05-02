import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle, XCircle, DollarSign, Clock, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

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
    plant_name: string | null;
    products: SupplierProduct[];
}

interface SupplierOrder {
    id: number;
    supplier_id: number;
    tank_type: string;
    quantity: number;
    price: number;
    total_amount: number;
    status: 'order_placed' | 'shipped' | 'received' | 'cancelled';
    payment_status: 'paid' | 'unpaid';
    notes: string | null;
    created_at: string;
    supplier: {
        id: number;
        name: string;
        plant_name: string | null;
    };
}

interface Props {
    orders: SupplierOrder[];
    suppliers: Supplier[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Supplier Orders', href: '/admin/supplier-orders' },
];

export default function AdminSupplierOrders({ orders, suppliers }: Props) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [notes, setNotes] = useState<string>('');

    const handleReceive = (orderId: number) => {
        if (confirm('Are you sure you want to mark this order as received? This will add the items to inventory.')) {
            router.post(`/admin/supplier-orders/${orderId}/receive`);
        }
    };

    const handleCancel = (orderId: number) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/admin/supplier-orders/${orderId}/cancel`);
        }
    };

    const handleTogglePayment = (orderId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        router.put(`/admin/supplier-orders/${orderId}/payment`, { payment_status: newStatus });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'order_placed':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Order Placed</span>;
            case 'shipped':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Shipped</span>;
            case 'received':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Received</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getPaymentBadge = (status: string) => {
        return status === 'paid' 
            ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
            : <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Unpaid</span>;
    };

    const stats = {
        total: orders.length,
        orderPlaced: orders.filter(o => o.status === 'order_placed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        received: orders.filter(o => o.status === 'received').length,
        unpaid: orders.filter(o => o.payment_status === 'unpaid').length,
    };

    const getSelectedSupplierProducts = () => {
        const supplier = suppliers.find(s => s.id.toString() === selectedSupplier);
        return supplier?.products || [];
    };

    const getSelectedProductPrice = () => {
        const products = getSelectedSupplierProducts();
        const product = products.find(p => p.id.toString() === selectedProduct);
        return product?.price || 0;
    };

    const handleSubmitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const products = getSelectedSupplierProducts();
        const product = products.find(p => p.id.toString() === selectedProduct);
        
        if (!product || !selectedSupplier) return;

        router.post('/admin/supplier-orders', {
            supplier_id: parseInt(selectedSupplier),
            tank_type: product.product_name,
            quantity: parseInt(quantity),
            price: product.price,
            notes: notes,
        }, {
            onSuccess: () => {
                setShowAddDialog(false);
                setSelectedSupplier('');
                setSelectedProduct('');
                setQuantity('1');
                setNotes('');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Supplier Orders - Admin" />

            <div className="p-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Supplier Orders</h1>
                        <p className="mt-2 text-gray-600">Manage orders from suppliers</p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Order
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Order Placed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.orderPlaced}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Shipped</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
                            </div>
                            <Truck className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Received</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unpaid</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.unpaid}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">All Supplier Orders</h2>
                    </div>
                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">No supplier orders have been placed yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">#{order.id}</td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {order.supplier.name}
                                                {order.supplier.plant_name && <span className="text-gray-500 text-sm ml-1">({order.supplier.plant_name})</span>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800">{order.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{order.quantity}</td>
                                            <td className="py-3 px-4 text-gray-800">₱{order.price.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-gray-800 font-medium">₱{order.total_amount.toFixed(2)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleTogglePayment(order.id, order.payment_status)}
                                                    className="cursor-pointer"
                                                >
                                                    {getPaymentBadge(order.payment_status)}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.status === 'order_placed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleCancel(order.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleReceive(order.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Receive
                                                    </Button>
                                                )}
                                                {order.status === 'received' && (
                                                    <span className="text-sm text-green-600">Added to inventory</span>
                                                )}
                                                {order.status === 'cancelled' && (
                                                    <span className="text-sm text-red-600">Cancelled</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* New Order Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>New Supplier Order</DialogTitle>
                        <DialogDescription>
                            Place an order to a supplier. Only products they offer will be shown.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Select value={selectedSupplier} onValueChange={(value) => {
                                setSelectedSupplier(value);
                                setSelectedProduct(''); // Reset product when supplier changes
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                            {supplier.name}
                                            {supplier.plant_name && ` (${supplier.plant_name})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product">Product</Label>
                            <Select 
                                value={selectedProduct} 
                                onValueChange={setSelectedProduct}
                                disabled={!selectedSupplier || getSelectedSupplierProducts().length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        !selectedSupplier 
                                            ? "Select supplier first" 
                                            : getSelectedSupplierProducts().length === 0 
                                                ? "No products available" 
                                                : "Select product"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {getSelectedSupplierProducts().map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.product_name} - ₱{product.price.toFixed(2)} / {product.unit}
                                            {product.stock_quantity <= 0 && ' (Out of Stock)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedProduct && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
                                <p><strong>Price:</strong> ₱{getSelectedProductPrice().toFixed(2)} per unit</p>
                                <p><strong>Available Stock:</strong> {getSelectedSupplierProducts().find(p => p.id.toString() === selectedProduct)?.stock_quantity || 0} units</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        {selectedProduct && quantity && (
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                <p className="font-medium">
                                    Total: ₱{(getSelectedProductPrice() * parseInt(quantity || '0')).toFixed(2)}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special instructions..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={!selectedSupplier || !selectedProduct}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Place Order
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
