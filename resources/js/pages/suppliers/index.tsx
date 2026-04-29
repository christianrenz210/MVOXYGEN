import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, MapPin, Phone, Mail, Plus, Edit, Trash2, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';

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
}

interface Props {
    suppliers: Supplier[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Suppliers', href: '/suppliers' },
];

export default function SuppliersIndex({ suppliers }: Props) {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderFormData, setOrderFormData] = useState({
        supplier_id: '',
        tank_type: '',
        quantity: '',
        price: '',
        notes: ''
    });

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            router.delete(`/suppliers/${id}`, {
                onSuccess: () => {
                    router.reload();
                }
            });
        }
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                        <p className="mt-2 text-gray-600">Manage your oxygen tank suppliers and plants</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowOrderModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Order from Supplier
                        </button>
                        <Link href={route('suppliers.create')}>
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Supplier
                            </Button>
                        </Link>
                    </div>
                </div>

                {suppliers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
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
                        {suppliers.map((supplier) => (
                            <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
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

                {/* Order from Supplier Modal */}
                {showOrderModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Order from Supplier</h3>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Package className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                    <select
                                        value={orderFormData.supplier_id}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, supplier_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name} {supplier.plant_name && `(${supplier.plant_name})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                    <select
                                        value={orderFormData.tank_type}
                                        onChange={(e) => {
                                            const tankType = e.target.value;
                                            setOrderFormData({ ...orderFormData, tank_type: tank_type });
                                            
                                            // Auto-fill price based on supplier's fixed price
                                            if (tankType && orderFormData.supplier_id) {
                                                const supplier = suppliers.find(s => s.id === parseInt(orderFormData.supplier_id));
                                                if (supplier) {
                                                    const priceField = tankType.toLowerCase().replace(/\s+/g, '_') + '_price';
                                                    const fixedPrice = supplier[priceField];
                                                    if (fixedPrice) {
                                                        setOrderFormData(prev => ({ 
                                                            ...prev, 
                                                            price: fixedPrice.toString(),
                                                            tank_type: tankType 
                                                        }));
                                                    }
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Tank Type</option>
                                        <option value="Oxygen Tank">Oxygen Tank</option>
                                        <option value="Argon Small">Argon Small</option>
                                        <option value="Argon Big">Argon Big</option>
                                        <option value="Nitro">Nitro</option>
                                        <option value="Medical Oxygen Big">Medical Oxygen Big</option>
                                        <option value="Medical Oxygen Medium">Medical Oxygen Medium</option>
                                        <option value="Flask Type Standard">Flask Type Standard</option>
                                        <option value="Flask Type Small">Flask Type Small</option>
                                        <option value="Industrial Oxygen">Industrial Oxygen</option>
                                        <option value="Acetylene">Acetylene</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={orderFormData.quantity}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={orderFormData.price}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Auto-filled from supplier fixed price"
                                        min="0"
                                        readOnly={orderFormData.supplier_id && orderFormData.tank_type}
                                    />
                                    {orderFormData.supplier_id && orderFormData.tank_type && (
                                        <p className="text-xs text-gray-500 mt-1">Price auto-filled from supplier's fixed rate</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={orderFormData.notes}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Optional notes..."
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowOrderModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Validate form
                                            if (!orderFormData.supplier_id || !orderFormData.tank_type || !orderFormData.quantity || !orderFormData.price) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }
                                            
                                            router.post('/admin/supplier-orders', orderFormData, {
                                                onSuccess: () => {
                                                    setShowOrderModal(false);
                                                    setOrderFormData({
                                                        supplier_id: '',
                                                        tank_type: '',
                                                        quantity: '',
                                                        price: '',
                                                        notes: ''
                                                    });
                                                },
                                                onError: (errors) => {
                                                    console.error('Error placing order:', errors);
                                                    alert('Error placing order. Please check all fields and try again.');
                                                }
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </AppLayout>
    );
}
