import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Users, Package, Calendar, Phone, CheckCircle, AlertCircle, Eye, Edit, Clock, RefreshCw, X, DollarSign } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface RentalRequest {
    id: number;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    product?: {
        id: number;
        name: string;
    };
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    contact_number: string;
    address: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    admin_notes?: string;
    rejected_reason?: string;
    created_at: string;
}

interface Props {
    rentalRequests: RentalRequest[];
}

export default function RefillsIndex({ rentalRequests }: Props) {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const allTankTypes = [
        { name: 'Argon Small', price: 1100 },
        { name: 'Argon Big', price: 2200 },
        { name: 'Nitro', price: 800 },
        { name: 'Medical Oxygen Big', price: 550 },
        { name: 'Medical Oxygen Medium', price: 500 },
        { name: 'Flask Type Standard', price: 350 },
        { name: 'Flask Type Small', price: 300 },
        { name: 'Industrial Oxygen', price: 550 },
        { name: 'Acetylene', price: 1700 }
    ];
    const [showNewRefillModal, setShowNewRefillModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        tank_type: '',
        refill_period: '',
        refill_cost: ''
    });

    const handleNewRefillClick = () => {
        setShowNewRefillModal(true);
    };

    const handleCloseModal = () => {
        setShowNewRefillModal(false);
        setFormData({
            customer_id: '',
            tank_type: '',
            refill_period: '',
            refill_cost: ''
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear tank type when customer changes
        if (name === 'customer_id') {
            setFormData(prev => ({ ...prev, tank_type: '' }));
        }
    };

    // Get filtered tank types based on selected customer's approved requests
    const getFilteredTankTypes = () => {
        if (!formData.customer_id) return [];
        const customerApprovedRequests = rentalRequests
            .filter(r => r.customer.id === parseInt(formData.customer_id) && r.status === 'approved')
            .map(r => r.tank_type);
        const uniqueTankTypes = [...new Set(customerApprovedRequests)];
        return allTankTypes.filter(tank => uniqueTankTypes.includes(tank.name));
    };

    const filteredTankTypes = getFilteredTankTypes();
    
    // Filter requests based on active tab
    const filteredRequests = activeTab === 'all' 
        ? rentalRequests 
        : rentalRequests.filter(r => r.status === activeTab);
    
    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    
    const handleTabChange = (tab: 'pending' | 'approved' | 'rejected' | 'all') => {
        setActiveTab(tab);
        setCurrentPage(1);
    };
    
    const getStatsCount = (status: 'pending' | 'approved' | 'rejected') => {
        return rentalRequests.filter(r => r.status === status).length;
    };

    const handleSubmitRefill = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/refills', formData, {
            onSuccess: () => {
                handleCloseModal();
                setShowSuccessModal(true);
            },
            onError: (errors) => {
                console.error('Error creating refill:', errors);
            }
        });
    };

    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this refill request?')) {
            router.post(`/refills/${id}/approve`, {}, {
                onSuccess: () => {
                    alert('Refill request approved successfully!');
                }
            });
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(`/refills/${id}/reject`, { rejected_reason: reason }, {
                onSuccess: () => {
                    alert('Refill request rejected successfully!');
                }
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Refills', href: '/refills' }
    ];

    return (
        <AppLayout>
            <Head title="Refill Requests - Admin" />
            <div className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: '2rem' }}>
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Refill Requests</h1>
                        <p className="text-gray-600">Manage oxygen tank refill requests and approvals</p>
                    </div>
                    <button onClick={handleNewRefillClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Refills
                    </button>
                </div>

                {/* Stats Cards - Clickable */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div 
                        onClick={() => handleTabChange('pending')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${activeTab === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-gray-800">{getStatsCount('pending')}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleTabChange('approved')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${activeTab === 'approved' ? 'ring-2 ring-green-400' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Approved</p>
                                <p className="text-2xl font-bold text-gray-800">{getStatsCount('approved')}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleTabChange('rejected')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${activeTab === 'rejected' ? 'ring-2 ring-red-400' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Rejected</p>
                                <p className="text-2xl font-bold text-gray-800">{getStatsCount('rejected')}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleTabChange('all')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${activeTab === 'all' ? 'ring-2 ring-blue-400' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-800">{rentalRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refill Requests Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeTab === 'all' ? 'All Refill Requests' : 
                             activeTab === 'pending' ? 'Pending Requests' :
                             activeTab === 'approved' ? 'Approved Requests' : 'Rejected Requests'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Refill Period</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRequests.map((request) => (
                                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-medium text-gray-800">{request.customer.name}</div>
                                                <div className="text-xs text-gray-500">{request.customer.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-800">{request.tank_type}</td>
                                        <td className="py-3 px-4 text-gray-800">{request.product?.id || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="text-gray-800">
                                                <div>{new Date(request.start_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">to {new Date(request.end_date).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <a
                                                    href={`/refills/${request.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Reject"
                                                        >
                                                            <AlertCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredRequests.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No {activeTab === 'all' ? '' : activeTab} refill requests found.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4 px-4">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Refill Modal */}
            {showNewRefillModal && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">New Refill Request</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRefill} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <select
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {(() => {
                                        // Get unique customers with approved requests
                                        const approvedCustomers = rentalRequests
                                            .filter(r => r.status === 'approved')
                                            .map(r => r.customer);
                                        const uniqueCustomers = Array.from(
                                            new Map(approvedCustomers.map(c => [c.id, c])).values()
                                        );
                                        return uniqueCustomers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} ({customer.email})
                                            </option>
                                        ));
                                    })()}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tank Type</label>
                                <select
                                    name="tank_type"
                                    value={formData.tank_type}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Tank Type</option>
                                    {filteredTankTypes.length > 0 ? (
                                        filteredTankTypes.map(tank => (
                                            <option key={tank.name} value={tank.name}>
                                                {tank.name}
                                            </option>
                                        ))
                                    ) : (
                                        allTankTypes.map(tank => (
                                            <option key={tank.name} value={tank.name}>
                                                {tank.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Refill Period</label>
                                <input
                                    type="text"
                                    name="refill_period"
                                    value={formData.refill_period}
                                    onChange={handleFormChange}
                                    placeholder="e.g., 1 week, 2 days"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Refill Cost</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        name="refill_cost"
                                        value={formData.refill_cost}
                                        onChange={handleFormChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Refill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Refill Request Added Successfully!</h3>
                            <p className="text-gray-600 mb-6">The refill request has been created and is now pending approval.</p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
