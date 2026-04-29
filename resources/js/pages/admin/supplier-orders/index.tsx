import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle, XCircle, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';

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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Supplier Orders', href: '/admin/supplier-orders' },
];

export default function AdminSupplierOrders({ orders }: Props) {
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
        </AppLayout>
    );
}
