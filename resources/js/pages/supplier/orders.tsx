import SupplierLayout from '@/layouts/supplier-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface SupplierOrder {
    id: number;
    tank_type: string;
    quantity: number;
    price: number;
    total_amount: number;
    status: 'order_placed' | 'shipped' | 'received' | 'cancelled';
    payment_status: 'paid' | 'unpaid';
    notes: string | null;
    created_at: string;
}

interface Props {
    orders: SupplierOrder[];
    supplier: {
        id: number;
        name: string;
        plant_name: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/supplier/dashboard' },
    { title: 'Orders', href: '/supplier/orders' },
];

export default function SupplierOrders({ orders, supplier }: Props) {
    const handleShip = (orderId: number) => {
        if (confirm('Are you sure you want to mark this order as shipped?')) {
            router.post(`/supplier/orders/${orderId}/ship`);
        }
    };

    const handleCancel = (orderId: number) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/supplier/orders/${orderId}/cancel`);
        }
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
    };

    return (
        <SupplierLayout>
            <Head title="Orders - Supplier Dashboard" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Distributor Order</h1>
                        <p className="mt-2 text-gray-600">Manage and track your distributor orders</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
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
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                    </div>
                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">You haven't received any orders yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
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
                                            <td className="py-3 px-4 text-gray-800">{order.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{order.quantity}</td>
                                            <td className="py-3 px-4 text-gray-800">₱{parseFloat(order.price).toFixed(2)}</td>
                                            <td className="py-3 px-4 text-gray-800 font-medium">₱{parseFloat(order.total_amount).toFixed(2)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                                            <td className="py-3 px-4">{getPaymentBadge(order.payment_status)}</td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.status === 'order_placed' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleShip(order.id)}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Ship
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleCancel(order.id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <span className="text-sm text-gray-500">Awaiting receipt</span>
                                                )}
                                                {order.status === 'received' && (
                                                    <span className="text-sm text-green-600">Completed</span>
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
        </SupplierLayout>
    );
}
