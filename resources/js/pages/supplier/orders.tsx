import SupplierLayout from '@/layouts/supplier-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface SupplierOrder {
    id: number;
    po_number: string | null;
    type: 'supplier_order' | 'purchase_order';
    tank_type: string;
    quantity: number;
    price: number;
    total_amount: number;
    status: 'order_placed' | 'shipped' | 'received' | 'cancelled' | 'pending' | 'partial_received' | 'preparing' | 'ready_to_ship';
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
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [receiveQuantities, setReceiveQuantities] = useState<{[key: number]: number}>({});
    const [paymentStatus, setPaymentStatus] = useState<string>('unpaid');
    const [validationError, setValidationError] = useState<string>('');

    const handleShip = (orderId: number, orderType: string) => {
        const order = orders.find((o: any) => o.id === orderId);
        if (confirm(`Are you sure you want to mark this order as shipped?\n\nOrder ID: ${orderId}\nType: ${orderType === 'supplier_order' ? 'Supplier Order' : 'Purchase Order'}\n\nThis action cannot be undone.`)) {
            if (orderType === 'supplier_order') {
                router.post(`/supplier/orders/${orderId}/ship`);
            } else {
                router.post(`/purchase-order/${orderId}/ship`);
            }
        }
    };

    const handleReceive = (order: any) => {
        setSelectedOrder(order);
        setReceiveQuantities({});
        setPaymentStatus(order.payment_status || 'unpaid');
        setValidationError('');
        setShowReceiveModal(true);
    };

    const handleReceiveSubmit = () => {
        if (!selectedOrder) return;

        const receivedQuantity = receiveQuantities[selectedOrder.id] || 0;
        const maxQuantity = selectedOrder.status === 'partial_received' 
            ? selectedOrder.quantity - (selectedOrder.received_count || 0)
            : selectedOrder.quantity;

        // Validation check
        if (receivedQuantity > maxQuantity) {
            setValidationError(`Cannot receive more than ${maxQuantity} units. You entered ${receivedQuantity} units.`);
            return;
        }

        if (receivedQuantity <= 0) {
            setValidationError('Please enter a valid quantity greater than 0.');
            return;
        }

        const items = Object.entries(receiveQuantities).map(([orderId, quantity]) => ({
            item_id: null, // Let backend handle the item assignment
            received_quantity: quantity
        }));

        console.log('Sending receive request:', {
            url: `/purchase-order/${selectedOrder.id}/receive`,
            items,
            payment_status: paymentStatus,
            orderId: selectedOrder.id,
            orderType: selectedOrder.type
        });

        router.post(`/purchase-order/${selectedOrder.id}/receive`, {
            items,
            payment_status: paymentStatus
        }, {
            onSuccess: () => {
                setShowReceiveModal(false);
                setSelectedOrder(null);
                setReceiveQuantities({});
                setPaymentStatus('unpaid');
                setValidationError('');
            }
        });
    };

    const handleCancel = (orderId: number) => {
        const order = orders.find((o: any) => o.id === orderId);
        if (confirm(`Are you sure you want to cancel this order?\n\nOrder ID: ${orderId}\nType: ${order?.type === 'supplier_order' ? 'Supplier Order' : 'Purchase Order'}\n\nThis action cannot be undone.`)) {
            router.post(`/supplier/orders/${orderId}/cancel`);
        }
    };

    const getStatusBadge = (status: string, type: string) => {
        if (type === 'purchase_order') {
            // Purchase Order statuses
            switch (status) {
                case 'pending':
                    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
                case 'preparing':
                    return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Preparing</span>;
                case 'ready_to_ship':
                    return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Ready to Ship</span>;
                case 'partial_received':
                    return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Partial Received</span>;
                case 'received':
                    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Received</span>;
                case 'cancelled':
                    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
                default:
                    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
            }
        } else {
            // Supplier Order statuses
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
        }
    };

    const getPaymentBadge = (status: string, method?: string) => {
        const statusColor = status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : status === 'partial_paid'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-orange-100 text-orange-800';
            
        const statusText = status === 'paid' 
            ? 'Paid' 
            : status === 'partial_paid'
            ? 'Partial Paid'
            : 'Unpaid';
            
        return (
            <div className="flex flex-col gap-1">
                <span className="px-2 py-1 text-xs rounded-full {statusColor}">{statusText}</span>
                {method && (
                    <span className="text-xs text-gray-600">
                        {method === 'cash' ? '💵 Cash' : 
                         method === 'gcash' ? '📱 GCash' : 
                         '🚚 Cash on Delivery'}
                    </span>
                )}
            </div>
        );
    };

    const stats = {
        total: orders.length,
        orderPlaced: orders.filter(o => o.status === 'order_placed').length,
        pending: orders.filter(o => o.status === 'pending').length,
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
                        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                        <p className="mt-2 text-gray-600">Manage and track all your orders</p>
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
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                            <Package className="w-8 h-8 text-orange-600" />
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
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">PO Number</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
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
                                                {order.po_number ? (
                                                    <span className="font-mono text-blue-600">{order.po_number}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.type === 'purchase_order' ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Purchase Order</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Supplier Order</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800">{order.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{order.quantity.toString()}</td>
                                            <td className="py-3 px-4 text-gray-800">₱{Number(order.price).toFixed(2)}</td>
                                            <td className="py-3 px-4 text-gray-800 font-medium">₱{Number(order.total_amount).toFixed(2)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(order.status, order.type)}</td>
                                            <td className="py-3 px-4">
                                                {order.type === 'supplier_order' ? getPaymentBadge(order.payment_status) : (
                                                    getPaymentBadge(order.payment_status, order.payment_method)
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.type === 'supplier_order' ? (
                                                    // Supplier Order actions
                                                    (order.status === 'order_placed' || order.status === 'pending') && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleShip(order.id, 'supplier_order')}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Truck className="h-4 w-4 mr-1" />
                                                                Ship
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleCancel(order.id)}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    )
                                                ) : (
                                                    // Purchase Order actions
                                                    (order.status === 'pending' || order.status === 'order_placed') ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleShip(order.id, 'purchase_order')}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Truck className="h-4 w-4 mr-1" />
                                                                Ship
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => alert(`Purchase Order Details\n\nPO Number: ${order.po_number}\nProducts: ${order.tank_type}\nQuantity: ${order.quantity}\nTotal: ₱${Number(order.total_amount).toFixed(2)}\n\nPlease check your email for more details.`)}
                                                            >
                                                                <Package className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (order.status === 'shipped' || order.status === 'partial_received') ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReceive(order)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                {order.status === 'partial_received' ? 'Receive More' : 'Receive'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => alert(`Purchase Order Details\n\nPO Number: ${order.po_number}\nProducts: ${order.tank_type}\nQuantity: ${order.quantity}\nTotal: ₱${Number(order.total_amount).toFixed(2)}\n\nPlease check your email for more details.`)}
                                                            >
                                                                <Package className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        // View only for other statuses
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => alert(`Purchase Order Details\n\nPO Number: ${order.po_number}\nProducts: ${order.tank_type}\nQuantity: ${order.quantity}\nTotal: ₱${Number(order.total_amount).toFixed(2)}\n\nPlease check your email for more details.`)}
                                                        >
                                                            <Package className="h-4 w-4" />
                                                        </Button>
                                                    )
                                                )}
                                                {order.type === 'supplier_order' && order.status === 'shipped' && (
                                                    <div className="flex gap-2">
                                                        <span className="text-sm text-gray-500">Shipped</span>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => alert(`Order has been shipped.\n\nTracking information will be sent to customer.\n\nType: Supplier Order`)}
                                                        >
                                                            <Truck className="h-4 w-4 mr-1" />
                                                            Ship Order
                                                        </Button>
                                                    </div>
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

                {/* Receive Items Modal */}
                {showReceiveModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Receive Items - PO #{selectedOrder.po_number}</h3>
                                <button
                                    onClick={() => setShowReceiveModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    <p><strong>Product:</strong> {selectedOrder.tank_type}</p>
                                    <p><strong>Ordered Quantity:</strong> {selectedOrder.quantity}</p>
                                    {selectedOrder.status === 'partial_received' && (
                                        <p><strong>Already Received:</strong> {selectedOrder.received_count || 0}</p>
                                    )}
                                    <p><strong>Price:</strong> ₱{Number(selectedOrder.price || selectedOrder.total_amount / selectedOrder.quantity).toFixed(2)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Additional Quantity to Receive
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedOrder.status === 'partial_received' ? selectedOrder.quantity - (selectedOrder.received_count || 0) : selectedOrder.quantity}
                                        value={receiveQuantities[selectedOrder.id] || 0}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            setReceiveQuantities(prev => ({
                                                ...prev,
                                                [selectedOrder.id]: value
                                            }));
                                            
                                            // Real-time validation
                                            const maxQuantity = selectedOrder.status === 'partial_received' 
                                                ? selectedOrder.quantity - (selectedOrder.received_count || 0)
                                                : selectedOrder.quantity;
                                            
                                            if (value > maxQuantity) {
                                                setValidationError(`Cannot receive more than ${maxQuantity} units. You entered ${value} units.`);
                                            } else if (value < 0) {
                                                setValidationError('Quantity cannot be negative.');
                                            } else {
                                                setValidationError('');
                                            }
                                        }}
                                        className={`w-full border rounded px-3 py-2 ${validationError ? 'border-red-500' : ''}`}
                                        placeholder="Enter additional quantity to receive"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedOrder.status === 'partial_received' 
                                            ? `Maximum: ${selectedOrder.quantity - (selectedOrder.received_count || 0)} more units (${selectedOrder.received_count || 0} already received)`
                                            : `Maximum: ${selectedOrder.quantity} units`
                                        }
                                    </p>
                                    {validationError && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-sm text-red-600">{validationError}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Payment Status
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial_paid">Partial Paid</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Update payment status for this order
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReceiveModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleReceiveSubmit}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={!receiveQuantities[selectedOrder.id] || receiveQuantities[selectedOrder.id] <= 0 || validationError !== ''}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Receive Items
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SupplierLayout>
    );
}
