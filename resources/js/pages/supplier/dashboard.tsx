import SupplierLayout from '@/layouts/supplier-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, Package, Truck, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ConfirmModal from '@/components/confirm-modal';
import { useState } from 'react';

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

interface Supplier {
    id: number;
    name: string;
    plant_name: string | null;
    address: string;
    contact_person: string;
    contact_number: string;
    email: string | null;
}

interface Props {
    orders: SupplierOrder[];
    supplier: Supplier;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/supplier/dashboard' },
];

export default function SupplierDashboard({ orders, supplier }: Props) {
    // Modal states
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

    const handleShip = (orderId: number) => {
        showConfirm(
            'Mark as Shipped',
            'Are you sure you want to mark this order as shipped?',
            () => {
                router.post(`/supplier/orders/${orderId}/ship`);
            },
            'warning'
        );
    };

    const handleCancel = (orderId: number) => {
        showConfirm(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            () => {
                router.post(`/supplier/orders/${orderId}/cancel`);
            },
            'danger'
        );
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
            <Head title="Supplier Dashboard - MV Oxygen Trading" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
                        <p className="mt-2 text-gray-600">Welcome, {supplier.name}</p>
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

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {stats.orderPlaced > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-yellow-800">Pending Orders</h3>
                                            <p className="text-sm text-yellow-600 mt-1">You have {stats.orderPlaced} orders to ship</p>
                                        </div>
                                        <Clock className="w-8 h-8 text-yellow-600" />
                                    </div>
                                </div>
                            )}
                            {stats.shipped > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-blue-800">Shipped Orders</h3>
                                            <p className="text-sm text-blue-600 mt-1">{stats.shipped} orders awaiting receipt</p>
                                        </div>
                                        <Truck className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
        </SupplierLayout>
    );
}
