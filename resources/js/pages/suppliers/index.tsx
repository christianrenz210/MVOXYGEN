import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, MapPin, Phone, Mail, Plus, Edit, Trash2, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';

interface Supplier {
    id: number;
    name: string;
    plant_name: string | null;
    address: string;
    contact_person: string;
    contact_number: string;
    email: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    // Price fields for different tank types
    oxygen_tank_price?: number;
    argon_small_price?: number;
    argon_big_price?: number;
    nitro_price?: number;
    medical_oxygen_big_price?: number;
    medical_oxygen_medium_price?: number;
    flask_type_standard_price?: number;
    flask_type_small_price?: number;
    industrial_oxygen_price?: number;
    acetylene_price?: number;
}

interface Props {
    suppliers: Supplier[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Suppliers', href: '/suppliers' },
];

export default function SuppliersIndex({ suppliers }: Props) {
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

    const handleDelete = (id: number) => {
        showConfirm(
            'Delete Supplier',
            'Are you sure you want to delete this supplier?',
            () => {
                router.delete(`/suppliers/${id}`, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'danger'
        );
    };

    const handleToggleActive = (id: number, isActive: boolean) => {
        router.put(`/suppliers/${id}`, { is_active: !isActive });
    };

    return (
        <AppLayout>
            <Head title="Suppliers - MV Oxygen Trading" />

            <div className="p-6 space-y-6">
                {/* Breadcrumbs at the bottom */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex items-center justify-between animate-fadeInUp">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                        <p className="mt-2 text-gray-600">Manage your oxygen tank suppliers and plants</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/purchase-order" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Order from Supplier
                        </Link>
                        <Link href={route('suppliers.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Supplier
                            </Button>
                        </Link>
                    </div>
                </div>

                {suppliers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                        <p className="text-gray-500 mb-6">Get started by adding your first supplier</p>
                        <Link href={route('suppliers.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Supplier
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suppliers.map((supplier, index) => (
                            <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow animate-fadeInUp" style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}>
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                supplier.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                                                {supplier.plant_name && (
                                                    <p className="text-sm text-gray-500">{supplier.plant_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 text-xs rounded-full ${
                                            supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {supplier.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{supplier.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span>{supplier.contact_number}</span>
                                        </div>
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4 flex-shrink-0" />
                                                <span className="line-clamp-1">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.contact_person && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>Contact: {supplier.contact_person}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Link
                                            href={route('suppliers.edit', supplier.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

            </div>
        </AppLayout>
    );
}
