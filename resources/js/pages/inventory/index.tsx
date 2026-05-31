import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, FileText, Plus, AlertTriangle, Phone, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState, useEffect, useMemo } from 'react';
import AlertModal from '@/components/alert-modal';

interface Product {
    id: number;
    tank_type: string;
    quantity: number;
    price?: number;
    last_refilled: string | null;
    status: string;
    image?: string;
    active_rental_count?: number;
}

interface Maintenance {
    id: number;
    tank_type: string;
    quantity: number;
    condition: string;
    status: 'pending' | 'in_maintenance' | 'done';
}

interface Supplier {
    id: number;
    name: string;
    plant_name: string | null;
}

type InventoryStatus = 'available' | 'rented_out' | 'maintenance';
type InventoryFilter = 'all' | InventoryStatus;

interface TankOption {
    name: string;
    price: number;
    quantity: number;
    orderDate: string | null;
}

interface Props {
    products: Product[];
    maintenances: Maintenance[];
    suppliers: Supplier[];
    availableTankOptions: TankOption[];
}

const createInitialFormState = () => ({
    tank_type: '',
    quantity: '',
    price: '',
    last_refilled: '',
    status: 'available' as InventoryStatus,
    image: null as File | null,
});

export default function InventoryIndex({ products, maintenances, suppliers, availableTankOptions }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        tanks: [{
            tank_type: '',
            quantity: '',
            price: '',
            last_refilled: '',
            status: 'available' as InventoryStatus,
            image: null as File | null,
        }],
        quantity_change_reason: ''
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
        condition: ''
    });
    const [selectedTankImage, setSelectedTankImage] = useState<string | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const [showLowStockModal, setShowLowStockModal] = useState(false);
    const [isQuantityEditEnabled, setIsQuantityEditEnabled] = useState(false);
    const [activeInventoryFilter, setActiveInventoryFilter] = useState<InventoryFilter>('all');

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    const existingTankTypes = useMemo(() => new Set(products.map(product => product.tank_type)), [products]);

    const filteredProducts = useMemo(() => {
        if (activeInventoryFilter === 'all') {
            return products;
        }

        if (activeInventoryFilter === 'rented_out') {
            return products.filter(product => (product.active_rental_count ?? 0) > 0);
        }

        return products.filter(product => product.status === activeInventoryFilter);
    }, [products, activeInventoryFilter]);

    const isActiveRentalView = activeInventoryFilter === 'rented_out';
    const tableColumnCount = isActiveRentalView ? 5 : 7;

    const {
        totalQuantity,
        availableCount,
        maintenanceCount,
        activeRentalCount,
    } = useMemo(() => {
        let totalQuantity = 0;
        let availableCount = 0;
        let maintenanceCount = 0;
        let activeRentalCount = 0;

        products.forEach(product => {
            totalQuantity += Number(product.quantity ?? 0);

            if (product.status === 'available') {
                availableCount += 1;
            }

            if (product.status === 'maintenance') {
                maintenanceCount += 1;
            }

            if ((product.active_rental_count ?? 0) > 0) {
                activeRentalCount += 1;
            }
        });

        return {
            totalQuantity,
            availableCount,
            maintenanceCount,
            activeRentalCount,
        };
    }, [products]);

    const updateEditPreview = (value: string | null) => {
        setEditImagePreview(prev => {
            if (prev && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return value;
        });
    };

    const getOptionForTankType = (tankType: string) => {
        return availableTankOptions.find(opt => opt.name === tankType);
    };

    const addTank = () => {
        setFormData(prev => ({
            ...prev,
            tanks: [...prev.tanks, {
                tank_type: '',
                quantity: '',
                price: '',
                last_refilled: '',
                status: 'available' as InventoryStatus,
                image: null as File | null,
            }]
        }));
    };

    const removeTank = (index: number) => {
        if (formData.tanks.length > 1) {
            setFormData(prev => ({
                ...prev,
                tanks: prev.tanks.filter((_, i) => i !== index)
            }));
        }
    };

    const handleTankChange = (index: number, field: string, value: string | File | null) => {
        const newTanks = [...formData.tanks];
        newTanks[index] = { ...newTanks[index], [field]: value };

        if (field === 'tank_type' && typeof value === 'string') {
            const option = getOptionForTankType(value);
            newTanks[index].price = option ? option.price.toFixed(2) : '';
            newTanks[index].quantity = option ? option.quantity.toString() : '';
            newTanks[index].last_refilled = option?.orderDate ?? '';
        }

        setFormData(prev => ({ ...prev, tanks: newTanks }));
    };

    const handleQuantityEditToggle = (checked: boolean) => {
        setIsQuantityEditEnabled(checked);
        if (!checked && selectedProduct) {
            setFormData(prev => {
                const updatedTanks = [...prev.tanks];
                if (updatedTanks[0]) {
                    updatedTanks[0] = {
                        ...updatedTanks[0],
                        quantity: selectedProduct.quantity.toString(),
                    };
                }
                return {
                    ...prev,
                    tanks: updatedTanks,
                    quantity_change_reason: '',
                };
            });
        }
    };

    const clearFormData = () => {
        setFormData({
            tanks: [{
                tank_type: '',
                quantity: '',
                price: '',
                last_refilled: '',
                status: 'available' as InventoryStatus,
                image: null as File | null,
            }],
            quantity_change_reason: ''
        });
        updateEditPreview(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedProduct(null);
        setIsQuantityEditEnabled(false);
        clearFormData();
    };

    // Check for low stock items (quantity <= 5)
    const lowStockItems = products.filter(product => product.quantity <= 5);
    const hasLowStock = lowStockItems.length > 0;

    // Show low stock modal on page load if there are low stock items
    useEffect(() => {
        if (hasLowStock) {
            setShowLowStockModal(true);
        }
    }, [hasLowStock]);

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

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
                <div className="mb-8 flex justify-between items-center animate-fadeInUp">
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
                    <div
                        onClick={() => setActiveInventoryFilter('all')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveInventoryFilter('all');
                            }
                        }}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all animate-fadeInUp cursor-pointer hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                            activeInventoryFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-500'
                        }`}
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Tanks</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {totalQuantity}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveInventoryFilter('available')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveInventoryFilter('available');
                            }
                        }}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all animate-fadeInUp cursor-pointer hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-300 ${
                            activeInventoryFilter === 'available' ? 'border-green-600 ring-2 ring-green-200' : 'border-green-500'
                        }`}
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Available</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {availableCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveInventoryFilter('rented_out')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveInventoryFilter('rented_out');
                            }
                        }}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all animate-fadeInUp cursor-pointer hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                            activeInventoryFilter === 'rented_out' ? 'border-yellow-600 ring-2 ring-yellow-200' : 'border-yellow-500'
                        }`}
                        style={{ animationDelay: '0.3s' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Rentals</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {activeRentalCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveInventoryFilter('maintenance')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveInventoryFilter('maintenance');
                            }
                        }}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all animate-fadeInUp cursor-pointer hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-300 ${
                            activeInventoryFilter === 'maintenance' ? 'border-red-600 ring-2 ring-red-200' : 'border-red-500'
                        }`}
                        style={{ animationDelay: '0.4s' }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">In Maintenance</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {maintenanceCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">All Tanks</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    {!isActiveRentalView && (
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    )}
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Refilled</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    {!isActiveRentalView && (
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={tableColumnCount} className="py-12 text-center text-gray-500">
                                            {activeInventoryFilter === 'all'
                                                ? 'No tanks found.'
                                                : activeInventoryFilter === 'rented_out'
                                                    ? 'No active rental records found yet.'
                                                    : 'No tanks match the selected status filter.'}
                                        </td>
                                    </tr>
                                )}
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            {product.image ? (
                                                <img
                                                    src={`${product.image}?t=${Date.now()}`}
                                                    alt={product.tank_type}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-gray-800">{product.tank_type}</td>
                                        {!isActiveRentalView && (
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
                                        )}
                                        <td className="py-3 px-4 text-gray-800">₱{Number(product.price ?? 0).toFixed(2)}</td>
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
                                                {product.status === 'available' ? 'Available' : product.status === 'rented_out' ? 'Rented' : 'In Maintenance'}
                                            </span>
                                            {(product.active_rental_count ?? 0) > 0 && (
                                                <span className="ml-2 text-xs text-yellow-600 font-medium">
                                                    {product.active_rental_count} active rental{(product.active_rental_count ?? 0) === 1 ? '' : 's'}
                                                </span>
                                            )}
                                        </td>
                                        {!isActiveRentalView && (
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => {
                                                        setIsQuantityEditEnabled(false);
                                                        setSelectedProduct(product);
                                                        setFormData({
                                                            tanks: [{
                                                                tank_type: product.tank_type,
                                                                quantity: product.quantity.toString(),
                                                                price: (product.price || 0).toString(),
                                                                last_refilled: product.last_refilled || '',
                                                                status: product.status as InventoryStatus,
                                                                image: null as File | null,
                                                            }],
                                                            quantity_change_reason: ''
                                                        });
                                                        updateEditPreview(product.image || null);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        )}
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
                <div className="bg-white rounded-xl shadow-lg p-6 mt-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
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
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center ${tank?.image ? 'hidden' : ''}`}>
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-800">{record.tank_type}</td>
                                            <td className="py-3 px-4 text-gray-800">{record.quantity}</td>
                                            <td className="py-3 px-4 text-gray-800">{record.condition}</td>
                                            <td className="py-3 px-4">
                                                {record.status === 'pending' && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                )}
                                                {record.status === 'in_maintenance' && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Maintenance</span>
                                                )}
                                                {record.status === 'done' && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Done</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {record.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            router.post(`/inventory/maintenance/${record.id}/start`);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                                                    >
                                                        In Maintenance
                                                    </button>
                                                )}
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                                        {availableTankOptions.map((option) => (
                                            <option key={option.name} value={option.name}>{option.name}</option>
                                        ))}
                                    </select>
                                    {availableTankOptions.length === 0 && (
                                        <p className="text-xs text-red-600 mt-1">No tank types available. Please create and receive purchase orders first.</p>
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
                                            }, {
                                                onSuccess: () => {
                                                    setShowMaintenanceModal(false);
                                                    setMaintenanceFormData({
                                                        tank_type: '',
                                                        quantity: '',
                                                        condition: '',
                                                    });
                                                },
                                                onError: (errors) => {
                                                    showAlert('Error', Object.values(errors).join('\n'), 'error');
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                                {/* Multiple Tank Selections */}
                                <div className="space-y-6">
                                    {formData.tanks.map((tank, index) => {
                                        const matchingOption = availableTankOptions.find(option => option.name === tank.tank_type);
                                        const autoPrice = matchingOption ? matchingOption.price.toFixed(2) : '';
                                        const autoQuantity = matchingOption ? matchingOption.quantity.toString() : '';
                                        const autoLastRefilled = matchingOption?.orderDate ?? '';

                                        return (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">Tank #{index + 1}</span>
                                                {formData.tanks.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTank(index)}
                                                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                                    <select
                                                        value={tank.tank_type}
                                                        onChange={(e) => handleTankChange(index, 'tank_type', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select Tank Type</option>
                                                        {availableTankOptions.map((option) => {
                                                            const isSelectedElsewhere = formData.tanks.some((t, i) => i !== index && t.tank_type === option.name);
                                                            const isDisabled = existingTankTypes.has(option.name) || isSelectedElsewhere;
                                                            return (
                                                                <option key={option.name} value={option.name} disabled={isDisabled}>
                                                                    {isDisabled ? `${option.name} (unavailable)` : option.name}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    {availableTankOptions.length === 0 && (
                                                        <p className="text-xs text-red-600 mt-1">No tank types available. Please create and receive purchase orders first.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={tank.quantity}
                                                        onChange={(e) => handleTankChange(index, 'quantity', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="1"
                                                        min="1"
                                                    />
                                                    {tank.tank_type && matchingOption && tank.quantity === autoQuantity && (
                                                        <p className="text-xs text-blue-600 mt-1">Quantity auto-filled from latest purchase order. Adjust if needed.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={tank.price}
                                                        onChange={(e) => handleTankChange(index, 'price', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="0.00"
                                                        min="0"
                                                    />
                                                    {tank.tank_type && matchingOption && tank.price === autoPrice && (
                                                        <p className="text-xs text-blue-600 mt-1">Price auto-filled from latest purchase order. Adjust if needed.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Refilled</label>
                                                    <input
                                                        type="date"
                                                        value={tank.last_refilled}
                                                        onChange={(e) => handleTankChange(index, 'last_refilled', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    {tank.tank_type && matchingOption?.orderDate && tank.last_refilled === autoLastRefilled && (
                                                        <p className="text-xs text-blue-600 mt-1">Last refilled date auto-filled from purchase order date. Adjust if needed.</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tank Image</label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleTankChange(index, 'image', file);
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 10MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>

                                <button
                                    type="button"
                                    onClick={addTank}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Another Tank
                                </button>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const hasMissingFields = formData.tanks.some(tank => !tank.tank_type || !tank.quantity || !tank.price);
                                            if (hasMissingFields) {
                                                showAlert('Incomplete Details', 'Please select a tank type and fill in quantity and price for each entry before adding.', 'warning');
                                                return;
                                            }

                                            const hasExistingDuplicates = formData.tanks.some(tank => existingTankTypes.has(tank.tank_type));
                                            if (hasExistingDuplicates) {
                                                showAlert('Already in Inventory', 'One or more selected tank types already exist in inventory. Remove them to proceed.', 'error');
                                                return;
                                            }

                                            const hasFormDuplicates = formData.tanks.some((tank, idx) =>
                                                formData.tanks.some((otherTank, otherIdx) =>
                                                    otherIdx !== idx && tank.tank_type === otherTank.tank_type
                                                )
                                            );
                                            if (hasFormDuplicates) {
                                                showAlert('Duplicate Selection', 'Each tank type can only be added once per submission.', 'error');
                                                return;
                                            }

                                            // Submit all tanks
                                            formData.tanks.forEach((tank) => {
                                                const data = new FormData();
                                                data.append('tank_type', tank.tank_type);
                                                data.append('quantity', tank.quantity);
                                                data.append('price', tank.price);
                                                data.append('last_refilled', tank.last_refilled);
                                                if (tank.image) {
                                                    data.append('image', tank.image);
                                                }
                                                router.post('/inventory', data);
                                            });
                                            setShowAddModal(false);
                                            setFormData({
                                                tanks: [{
                                                    tank_type: '',
                                                    quantity: '',
                                                    price: '',
                                                    last_refilled: '',
                                                    status: 'available' as InventoryStatus,
                                                    image: null as File | null,
                                                }],
                                                quantity_change_reason: ''
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
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Edit Tank</h3>
                                <button
                                    onClick={() => {
                                        closeEditModal();
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
                                        value={formData.tanks[0].tank_type}
                                        onChange={(e) => handleTankChange(0, 'tank_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                        disabled
                                    >
                                        <option value="">Select Tank Type</option>
                                        {availableTankOptions.map((option) => (
                                            <option key={option.name} value={option.name}>{option.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Tank type cannot be changed after creation</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {`Quantity${isQuantityEditEnabled ? ' *' : ''}`}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={isQuantityEditEnabled}
                                                onChange={(e) => handleQuantityEditToggle(e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>Edit quantity</span>
                                        </label>
                                    </div>
                                    {!isQuantityEditEnabled ? (
                                        <>
                                            <p className="text-base font-medium text-gray-800">
                                                {formData.tanks[0].quantity || (selectedProduct ? selectedProduct.quantity.toString() : '0')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Enable editing to adjust the quantity.</p>
                                        </>
                                    ) : (
                                        <input
                                            type="number"
                                            value={formData.tanks[0].quantity}
                                            onChange={(e) => handleTankChange(0, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    )}
                                </div>

                                {isQuantityEditEnabled && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Quantity Change *</label>
                                        <textarea
                                            value={formData.quantity_change_reason}
                                            onChange={(e) => setFormData({ ...formData, quantity_change_reason: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Please explain why you are changing the quantity..."
                                            rows={3}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Required when quantity is changed</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.tanks[0].price}
                                        onChange={(e) => handleTankChange(0, 'price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Refilled</label>
                                    <input
                                        type="date"
                                        value={formData.tanks[0].last_refilled}
                                        onChange={(e) => handleTankChange(0, 'last_refilled', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.tanks[0].status}
                                        onChange={(e) => handleTankChange(0, 'status', e.target.value)}
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
                                                const previewUrl = URL.createObjectURL(file);
                                                handleTankChange(0, 'image', file);
                                                updateEditPreview(previewUrl);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 10MB.</p>
                                    {editImagePreview && (
                                        <img
                                            src={editImagePreview}
                                            alt="Current tank image"
                                            className="mt-2 w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            closeEditModal();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!selectedProduct) {
                                                return;
                                            }

                                            const originalQuantity = selectedProduct.quantity;
                                            const editedQuantityValue = formData.tanks[0].quantity;
                                            const parsedEditedQuantity = parseInt(editedQuantityValue, 10);
                                            const quantityChanged = !Number.isNaN(parsedEditedQuantity) && parsedEditedQuantity !== originalQuantity;

                                            if (isQuantityEditEnabled) {
                                                if (!editedQuantityValue) {
                                                    showAlert('Missing Quantity', 'Please enter the updated quantity before saving.', 'warning');
                                                    return;
                                                }

                                                if (Number.isNaN(parsedEditedQuantity) || parsedEditedQuantity < 0) {
                                                    showAlert('Invalid Quantity', 'Quantity must be a number greater than or equal to 0.', 'error');
                                                    return;
                                                }

                                                if (quantityChanged && formData.quantity_change_reason.trim().length === 0) {
                                                    showAlert('Reason Required', 'Please provide a reason for changing the quantity.', 'warning');
                                                    return;
                                                }
                                            }

                                            const data = new FormData();
                                            data.append('_method', 'PUT');
                                            data.append('tank_type', formData.tanks[0].tank_type);
                                            const quantityToSubmit = isQuantityEditEnabled ? editedQuantityValue : originalQuantity.toString();
                                            data.append('quantity', quantityToSubmit);
                                            data.append('price', formData.tanks[0].price);
                                            data.append('last_refilled', formData.tanks[0].last_refilled);
                                            data.append('status', formData.tanks[0].status);
                                            data.append('quantity_change_reason', isQuantityEditEnabled ? formData.quantity_change_reason : '');
                                            if (formData.tanks[0].image) {
                                                data.append('image', formData.tanks[0].image);
                                            }
                                            router.post(`/inventory/${selectedProduct.id}`, data, {
                                                onSuccess: () => {
                                                    router.reload({ only: ['products'] });
                                                    closeEditModal();
                                                },
                                                onError: (errors) => {
                                                    showAlert('Error', 'Error updating tank: ' + JSON.stringify(errors), 'error');
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </AppLayout>
    );
}
