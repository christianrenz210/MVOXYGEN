import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { TrendingUp, DollarSign, Calendar, Package, RefreshCw, Clock, Users, AlertCircle, CheckCircle, Phone, RotateCcw, ChevronLeft, ChevronRight, XCircle, Eye } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import AlertModal from '@/components/alert-modal';
import ConfirmModal from '@/components/confirm-modal';
import PromptModal from '@/components/prompt-modal';
import { useState } from 'react';
import { formatPhoneNumber } from '@/utils/phone';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';

interface Rental {
    id: number;
    status: string;
    deposit_type?: string;
    deposit_amount?: number;
    deposit_payment_date?: string;
    deposit_status?: string;
}

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
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'canceled';
    admin_notes?: string;
    rejected_reason?: string;
    created_at: string;
    request_type?: string;
    rental?: Rental;
}

interface Props {
    rentalRequests: RentalRequest[];
}

export default function RentalIndex({ rentalRequests }: Props) {
    const { url } = usePage().props;
    const isRefillsPage = typeof url === 'string' && url.includes('/refills');
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // New filter states
    const [customerNameSort, setCustomerNameSort] = useState<'asc' | 'desc' | null>(null);
    const [selectedTankType, setSelectedTankType] = useState<string>('all');
    
    // Deposit modal state
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositError, setDepositError] = useState('');
    const [depositPaymentMethod, setDepositPaymentMethod] = useState('cash');
    const [depositReferenceNumber, setDepositReferenceNumber] = useState('');

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
    });

    // Prompt modal state
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [promptConfig, setPromptConfig] = useState({
        title: '',
        message: '',
        placeholder: '',
        onConfirm: (value: string) => {},
        type: 'info' as 'info' | 'warning' | 'danger'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirmModal(true);
    };

    const showPrompt = (title: string, message: string, placeholder: string, onConfirm: (value: string) => void, type: 'info' | 'warning' | 'danger' = 'info') => {
        setPromptConfig({ title, message, placeholder, onConfirm, type });
        setShowPromptModal(true);
    };

    // Reset page when filter changes
    const handleFilterChange = (filter: StatusFilter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    // Get unique tank types
    const uniqueTankTypes = Array.from(new Set(rentalRequests.map(r => r.tank_type))).sort();

    // Get filtered and sorted requests
    const filteredRequests = rentalRequests.filter(request => {
        const statusMatch = activeFilter === 'all' || request.status === activeFilter;
        const tankTypeMatch = selectedTankType === 'all' || request.tank_type === selectedTankType;
        return statusMatch && tankTypeMatch;
    }).sort((a, b) => {
        if (customerNameSort) {
            const comparison = a.customer.name.localeCompare(b.customer.name);
            return customerNameSort === 'asc' ? comparison : -comparison;
        }
        return 0;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    const handleApprove = (id: number) => {
        setSelectedRequest(id);
        setDepositAmount('');
        setDepositError('');
        setDepositPaymentMethod('cash');
        setDepositReferenceNumber('');
        setShowDepositModal(true);
    };

    const validateDepositAmount = (amount: string) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 1000) {
            setDepositError('Minimum deposit amount is ₱1,000');
            return false;
        }
        setDepositError('');
        return true;
    };

    const handleDepositAmountChange = (value: string) => {
        setDepositAmount(value);
        if (value) {
            validateDepositAmount(value);
        } else {
            setDepositError('');
        }
    };

    const handleConfirmApproval = () => {
        if (!validateDepositAmount(depositAmount)) {
            return;
        }

        router.post(`/rentals/${selectedRequest}/approve`, {
            deposit_amount: depositAmount,
            payment_method: depositPaymentMethod,
            reference_number: depositReferenceNumber
        }, {
            onSuccess: () => {
                showAlert('Success', 'Rental request approved successfully!', 'success');
                handleCloseModal();
            },
            onError: (errors) => {
                setDepositError(errors.deposit_amount || 'Failed to approve request. Please try again.');
            }
        });
    };

    const handleCloseModal = () => {
        const numAmount = parseFloat(depositAmount);
        console.log('Attempting to close modal. Deposit amount:', depositAmount, 'Parsed:', numAmount);
        
        // Always validate if there's any deposit amount entered
        if (depositAmount !== '') {
            if (isNaN(numAmount) || numAmount < 1000) {
                // Don't close modal if deposit amount is below minimum
                setDepositError('Please enter a valid deposit amount (minimum ₱1,000) before closing.');
                console.log('Modal close blocked - invalid deposit amount');
                return;
            }
        }
        
        setShowDepositModal(false);
        setSelectedRequest(null);
        setDepositAmount('');
        setDepositError('');
        setDepositReferenceNumber('');
        console.log('Modal closed successfully');
    };

    const handleReject = (id: number) => {
        showPrompt(
            'Reject Rental Request',
            'Please provide a reason for rejection:',
            'Enter rejection reason...',
            (reason) => {
                router.post(`/rentals/${id}/reject`, { rejected_reason: reason }, {
                    onSuccess: () => {
                        showAlert('Success', 'Rental request rejected successfully!', 'success');
                    }
                });
            },
            'danger'
        );
    };

    const handleCancel = (id: number) => {
        showConfirm(
            'Cancel Rental Request',
            'Are you sure you want to cancel this rental request?',
            () => {
                router.post(`/rentals/${id}/cancel`, {}, {
                    onSuccess: () => {
                        showAlert('Success', 'Rental request canceled successfully!', 'success');
                    }
                });
            },
            'danger'
        );
    };

    const handleReturn = (id: number) => {
        showConfirm(
            'Mark as Returned',
            'Are you sure you want to mark this rental as returned?',
            () => {
                router.post(`/rentals/${id}/return`, {}, {
                    onSuccess: () => {
                        showAlert('Success', 'Rental marked as returned successfully!', 'success');
                    }
                });
            },
            'warning'
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            canceled: 'bg-gray-100 text-gray-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: isRefillsPage ? 'Refills' : 'Rentals', href: isRefillsPage ? '/refills' : '/rentals' }
    ];

    return (
        <AppLayout>
            <Head title={isRefillsPage ? 'Refill Requests - Admin' : 'Rental Requests - Admin'} />
            <div className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: '2rem' }}>
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{isRefillsPage ? 'Refill Requests' : 'Rental Requests'}</h1>
                    <p className="text-gray-600">{isRefillsPage ? 'Manage oxygen tank refill requests and approvals' : 'Manage oxygen tank rental requests and approvals'}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    {/* All Requests Card */}
                    <div 
                        onClick={() => handleFilterChange('all')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'all' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">All Requests</p>
                                <p className="text-2xl font-bold text-gray-800">{rentalRequests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="font-bold text-muted-foreground">₱</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div 
                        onClick={() => handleFilterChange('pending')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'pending' ? 'border-yellow-600 ring-2 ring-yellow-200' : 'border-yellow-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Approved Card */}
                    <div 
                        onClick={() => handleFilterChange('approved')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'approved' ? 'border-green-600 ring-2 ring-green-200' : 'border-green-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Approved</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Rejected Card */}
                    <div 
                        onClick={() => handleFilterChange('rejected')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'rejected' ? 'border-red-600 ring-2 ring-red-200' : 'border-red-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Rejected</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'rejected').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Completed Card */}
                    <div 
                        onClick={() => handleFilterChange('completed')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'completed' ? 'border-purple-600 ring-2 ring-purple-200' : 'border-purple-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'completed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Canceled Card */}
                    <div 
                        onClick={() => handleFilterChange('canceled')}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 cursor-pointer transition-all hover:shadow-xl ${
                            activeFilter === 'canceled' ? 'border-gray-600 ring-2 ring-gray-200' : 'border-gray-500'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Canceled</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'canceled').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rental Requests Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeFilter === 'all' ? 'All Rental Requests' : 
                             activeFilter === 'pending' ? 'Pending Requests' :
                             activeFilter === 'approved' ? 'Approved Requests' :
                             activeFilter === 'rejected' ? 'Rejected Requests' :
                             activeFilter === 'completed' ? 'Completed Requests' :
                             'Canceled Requests'}
                        </h2>
                    </div>

                    {/* Filter Controls */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex flex-wrap gap-4">
                            {/* Customer Name Sort */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Customer Name:</label>
                                <select
                                    value={customerNameSort || ''}
                                    onChange={(e) => {
                                        setCustomerNameSort(e.target.value as 'asc' | 'desc' | null);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Default</option>
                                    <option value="asc">A-Z</option>
                                    <option value="desc">Z-A</option>
                                </select>
                            </div>

                            {/* Tank Type Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Tank Type:</label>
                                <select
                                    value={selectedTankType}
                                    onChange={(e) => {
                                        setSelectedTankType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Tank Types</option>
                                    {uniqueTankTypes.map(tankType => (
                                        <option key={tankType} value={tankType}>{tankType}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Status:</label>
                                <select
                                    value={activeFilter}
                                    onChange={(e) => {
                                        handleFilterChange(e.target.value as StatusFilter);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rental Period</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    {activeFilter !== 'canceled' && activeFilter !== 'rejected' && <th className="text-left py-3 px-4 font-semibold text-gray-700">Return</th>}
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
                                        <td className="py-3 px-4 text-gray-800">{request.quantity}</td>
                                        <td className="py-3 px-4">
                                            <div className="text-gray-800">
                                                <div>{new Date(request.start_date).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">to {new Date(request.end_date).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-gray-800">
                                                <div className="flex items-center">
                                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                    {formatPhoneNumber(request.contact_number)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href={request.request_type === 'refill' ? `/refills/${request.id}` : `/rentals/${request.id}`}
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
                                                        <button
                                                            onClick={() => handleCancel(request.id)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                            title="Cancel Request"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        {activeFilter !== 'canceled' && activeFilter !== 'rejected' && (
                                        <td className="py-3 px-4">
                                            {request.status === 'approved' && (
                                                <button
                                                    onClick={() => handleReturn(request.id)}
                                                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                                                    title="Mark as Returned"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Return
                                                </button>
                                            )}
                                            {request.status === 'completed' && (
                                                <span className="text-xs text-gray-500">Returned</span>
                                            )}
                                        </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredRequests.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>
                                    {activeFilter === 'all' ? 'No rental requests found.' :
                                     activeFilter === 'pending' ? 'No pending requests found.' :
                                     activeFilter === 'approved' ? 'No approved requests found.' :
                                     activeFilter === 'rejected' ? 'No rejected requests found.' :
                                     'No completed requests found.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {filteredRequests.length > itemsPerPage && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} results
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        

                    </div>
                </div>

                {/* Deposit Information Table */}
                {rentalRequests.some(r => r.rental) && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Deposit Information</h2>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                                <p className="text-xs text-yellow-800 font-medium">
                                    Minimum deposit: ₱1,000
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Deposit Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentalRequests.filter(r => r.rental).map((request) => (
                                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">
                                                {request.rental?.deposit_type || 'Security Deposit'}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {request.rental?.deposit_amount !== null && request.rental?.deposit_amount !== undefined ? (
                                                    <div>
                                                        <span className={request.rental.deposit_amount < 1000 ? "text-red-600 font-semibold" : ""}>
                                                            ₱{request.rental.deposit_amount.toFixed(2)}
                                                        </span>
                                                        {request.rental.deposit_amount < 1000 && (
                                                            <div className="text-xs text-red-500 mt-1">
                                                                Below minimum (₱1,000)
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">₱0.00</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {request.rental?.deposit_payment_date ?
                                                    new Date(request.rental.deposit_payment_date).toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    }) :
                                                    new Date().toLocaleDateString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric'
                                                    })
                                                }
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    request.rental?.deposit_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    request.rental?.deposit_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {request.rental?.deposit_status || 'pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {rentalRequests.filter(r => r.rental).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No deposit information found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Deposit Modal */}
                {showDepositModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
                        // Prevent closing when clicking outside if deposit is invalid
                        const numAmount = parseFloat(depositAmount);
                        if (depositAmount !== '' && (isNaN(numAmount) || numAmount < 1000)) {
                            e.stopPropagation();
                            setDepositError('Please enter a valid deposit amount (minimum ₱1,000) before closing.');
                        }
                    }}>
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Deposit Information</h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-yellow-800 font-medium">
                                        Minimum deposit: ₱1,000
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount (₱)</label>
                                    <input
                                        type="number"
                                        value={depositAmount}
                                        onChange={(e) => handleDepositAmountChange(e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            depositError ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter deposit amount"
                                        min="1000"
                                        step="0.01"
                                    />
                                    {depositError && (
                                        <p className="text-red-500 text-sm mt-1">{depositError}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={depositPaymentMethod}
                                        onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="gcash">GCash</option>
                                        <option value="maya">Maya</option>
                                    </select>
                                </div>

                                {(depositPaymentMethod === 'bank_transfer' || depositPaymentMethod === 'gcash' || depositPaymentMethod === 'maya') && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                                        <input
                                            type="text"
                                            value={depositReferenceNumber}
                                            onChange={(e) => setDepositReferenceNumber(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter reference number"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmApproval}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!depositAmount || parseFloat(depositAmount) < 1000}
                                >
                                    Approve with Deposit
                                </button>
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

            {/* Prompt Modal */}
            <PromptModal
                isOpen={showPromptModal}
                onClose={() => setShowPromptModal(false)}
                onConfirm={(value) => {
                    promptConfig.onConfirm(value);
                    setShowPromptModal(false);
                }}
                title={promptConfig.title}
                message={promptConfig.message}
                placeholder={promptConfig.placeholder}
                type={promptConfig.type}
            />
        </AppLayout>
    );
}
