import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, FileText, Plus, AlertTriangle, Phone, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState, useEffect } from 'react';

interface Product {
    id: number;
    tank_type: string;
    quantity: number;
    price?: number;
    last_refilled: string | null;
    status: string;
    image?: string;
}

interface Maintenance {
    id: number;
    tank_type: string;
    quantity: number;
    condition: string;
    valve: string;
}

interface Supplier {
    id: number;
    name: string;
    plant_name: string | null;
}

interface Props {
    products: Product[];
    maintenances: Maintenance[];
    suppliers: Supplier[];
}

export default function InventoryIndex({ products, maintenances, suppliers }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        tank_type: '',
        quantity: '',
        price: '',
        last_refilled: '',
        image: null as File | null
    });
    const [orderFormData, setOrderFormData] = useState({
        supplier_id: '',
        tank_type: '',
        quantity: '',
        price: '',
        notes: ''
    });
    const [maintenanceFormData, setMaintenanceFormData] = useState({
        tank_type: '',
        quantity: '',
        condition: '',
        valve: ''
    });
    const [selectedTankImage, setSelectedTankImage] = useState<string | null>(null);
    const [showLowStockModal, setShowLowStockModal] = useState(false);

    // Check for low stock items (quantity <= 5)
    const lowStockItems = products.filter(product => product.quantity <= 5);
    const hasLowStock = lowStockItems.length > 0;

    // Show low stock modal on page load if there are low stock items
    useEffect(() => {
        if (hasLowStock) {
            setShowLowStockModal(true);
        }
    }, [hasLowStock]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventory', href: '/inventory' }
    ];

    return (
        <AppLayout>
            <Head title="Inventory - Admin" />
            <div className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: '2rem' }}>
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory</h1>
                        <p className="text-gray-600">Manage oxygen tank inventory and stock levels</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Products
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Tanks</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.reduce((sum, p) => sum + p.quantity, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Available</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => p.status === 'available').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Rented Out</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => p.status === 'rented_out').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">In Maintenance</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {products.filter(p => p.status === 'maintenance').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">All Tanks</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Refilled</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.tank_type}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-gray-800">{product.tank_type}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${product.quantity <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {product.quantity}
                                                </span>
                                                {product.quantity <= 5 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-800">₱{parseFloat(product.price || 0).toFixed(2)}</td>
                                        <td className="py-3 px-4 text-gray-800">
                                            {product.last_refilled ? new Date(product.last_refilled).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                product.status === 'available'
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.status === 'rented_out'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.status === 'available' ? 'Available' : product.status === 'rented_out' ? 'Rented Out' : 'In Maintenance'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setFormData({
                                                        tank_type: product.tank_type,
                                                        quantity: product.quantity.toString(),
                                                        price: (product.price || 0).toString(),
                                                        last_refilled: product.last_refilled || '',
                                                        status: product.status,
                                                        image: null
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {products.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No tanks found in inventory.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Maintenance Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Maintenance</h2>
                        <button
                            onClick={() => setShowMaintenanceModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Maintenance
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Condition</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valve</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenances.map((record) => {
                                    const tank = products.find(p => p.tank_type === record.tank_type);
                                    return (
                                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                {tank?.image ? (
                                                    <img
                                                        src={tank.image}
                                                        alt={record.tank_type}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-800">{record.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{record.quantity}</td>
                                            <td className="py-3 px-4 text-gray-800">{record.condition}</td>
                                            <td className="py-3 px-4 text-gray-800">{record.valve}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    record.status === 'done'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.status === 'done' ? 'Done' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {record.status !== 'done' && (
                                                    <button
                                                        onClick={() => {
                                                            router.post(`/inventory/maintenance/${record.id}/complete`);
                                                        }}
                                                        className="text-green-600 hover:text-green-800 font-medium mr-3"
                                                    >
                                                        Done
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedMaintenance(record);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {maintenances.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No maintenance records found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Maintenance Modal */}
                {showMaintenanceModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Add Maintenance</h3>
                                <button
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Package className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                    <select
                                        value={maintenanceFormData.tank_type}
                                        onChange={(e) => {
                                            const selectedType = e.target.value;
                                            setMaintenanceFormData({ ...maintenanceFormData, tank_type: selectedType });
                                            // Auto-select tank image from inventory
                                            const tank = products.find(p => p.tank_type === selectedType);
                                            setSelectedTankImage(tank?.image || null);
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

                                    {/* Auto-display tank image */}
                                    {selectedTankImage && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Tank Image</p>
                                            <img
                                                src={selectedTankImage}
                                                alt={maintenanceFormData.tank_type}
                                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={maintenanceFormData.quantity}
                                        onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                    <select
                                        value={maintenanceFormData.condition}
                                        onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, condition: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Condition</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Damaged">Damaged</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valve</label>
                                    <select
                                        value={maintenanceFormData.valve}
                                        onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, valve: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Valve Type</option>
                                        <option value="Working">Working</option>
                                        <option value="Leaking">Leaking</option>
                                        <option value="Broken">Broken</option>
                                        <option value="Replacement Needed">Replacement Needed</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowMaintenanceModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.post('/inventory/maintenance', {
                                                tank_type: maintenanceFormData.tank_type,
                                                quantity: parseInt(maintenanceFormData.quantity),
                                                condition: maintenanceFormData.condition,
                                                valve: maintenanceFormData.valve
                                            }, {
                                                onSuccess: () => {
                                                    setShowMaintenanceModal(false);
                                                    setMaintenanceFormData({
                                                        tank_type: '',
                                                        quantity: '',
                                                        condition: '',
                                                        valve: ''
                                                    });
                                                },
                                                onError: (errors) => {
                                                    alert(Object.values(errors).join('\n'));
                                                }
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Maintenance Modal */}
                {showViewModal && selectedMaintenance && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Maintenance Details</h3>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedMaintenance(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Package className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Tank Type</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedMaintenance.tank_type}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Quantity</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedMaintenance.quantity}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedMaintenance.condition}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Valve</label>
                                    <p className="text-lg font-semibold text-gray-800">{selectedMaintenance.valve}</p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false);
                                            setSelectedMaintenance(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Tanks Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Add Products</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Package className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                    <select
                                        value={formData.tank_type}
                                        onChange={(e) => setFormData({ ...formData, tank_type: e.target.value })}
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
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Refilled</label>
                                    <input
                                        type="date"
                                        value={formData.last_refilled}
                                        onChange={(e) => setFormData({ ...formData, last_refilled: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFormData({ ...formData, image: file });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 10MB.</p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const data = new FormData();
                                            data.append('tank_type', formData.tank_type);
                                            data.append('quantity', formData.quantity);
                                            data.append('price', formData.price);
                                            data.append('last_refilled', formData.last_refilled);
                                            if (formData.image) {
                                                data.append('image', formData.image);
                                            }
                                            router.post('/inventory', data, {
                                                onSuccess: () => {
                                                    setShowAddModal(false);
                                                    setFormData({
                                                        tank_type: '',
                                                        quantity: '',
                                                        price: '',
                                                        last_refilled: '',
                                                        image: null
                                                    });
                                                }
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {/* Edit Tank Modal */}
                {showEditModal && selectedProduct && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Edit Tank</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProduct(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Package className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                    <select
                                        value={formData.tank_type}
                                        onChange={(e) => setFormData({ ...formData, tank_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                        disabled
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
                                    <p className="text-xs text-gray-500 mt-1">Tank type cannot be changed after creation</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Refilled</label>
                                    <input
                                        type="date"
                                        value={formData.last_refilled}
                                        onChange={(e) => setFormData({ ...formData, last_refilled: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="available">Available</option>
                                        <option value="rented_out">Rented Out</option>
                                        <option value="maintenance">In Maintenance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFormData({ ...formData, image: file });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 10MB.</p>
                                    {selectedProduct.image && (
                                        <img
                                            src={selectedProduct.image}
                                            alt="Current tank image"
                                            className="mt-2 w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedProduct(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('Updating tank with ID:', selectedProduct.id);
                                            console.log('Form data:', formData);
                                            const data = new FormData();
                                            data.append('_method', 'PUT');
                                            data.append('tank_type', formData.tank_type);
                                            data.append('quantity', formData.quantity);
                                            data.append('price', formData.price);
                                            data.append('last_refilled', formData.last_refilled);
                                            data.append('status', formData.status);
                                            if (formData.image) {
                                                data.append('image', formData.image);
                                                console.log('Image file to upload:', formData.image);
                                            }
                                            router.post(`/inventory/${selectedProduct.id}`, data, {
                                                onSuccess: () => {
                                                    console.log('Update successful');
                                                    setShowEditModal(false);
                                                    setSelectedProduct(null);
                                                },
                                                onError: (errors) => {
                                                    console.error('Update errors:', errors);
                                                    alert('Error updating tank: ' + JSON.stringify(errors));
                                                }
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Low Stock Alert Modal */}
                {showLowStockModal && hasLowStock && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-700">Low Stock Alert!</h3>
                                </div>
                                <button
                                    onClick={() => setShowLowStockModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4">
                                The following items are running low on stock. Please contact your supplier to restock:
                            </p>

                            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                {lowStockItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.tank_type}</p>
                                            <p className="text-sm text-red-600">Only {item.quantity} remaining</p>
                                        </div>
                                        <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-red-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Phone className="w-5 h-5 text-yellow-600" />
                                    <p className="font-semibold text-yellow-800">Action Required</p>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Contact your supplier immediately to restock these items to avoid running out of inventory.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLowStockModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <a
                                    href="/suppliers"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                                >
                                    Contact Suppliers
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
