import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Users, Package, Calendar, Phone, CheckCircle, AlertCircle, Eye, Edit, Clock, RotateCcw } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

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
    status: 'pending' | 'approved' | 'rejected' | 'completed';
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

    // Reset page when filter changes
    const handleFilterChange = (filter: StatusFilter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    // Get filtered requests
    const filteredRequests = rentalRequests.filter(request => 
        activeFilter === 'all' || request.status === activeFilter
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this rental request?')) {
            router.post(`/rentals/${id}/approve`, {}, {
                onSuccess: () => {
                    alert('Rental request approved successfully!');
                }
            });
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            router.post(`/rentals/${id}/reject`, { rejected_reason: reason }, {
                onSuccess: () => {
                    alert('Rental request rejected successfully!');
                }
            });
        }
    };

    const handleReturn = (id: number) => {
        if (confirm('Are you sure you want to mark this rental as returned?')) {
            router.post(`/rentals/${id}/return`, {}, {
                onSuccess: () => {
                    alert('Rental marked as returned successfully!');
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                                <Users className="w-6 h-6 text-blue-600" />
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
                </div>

                {/* Rental Requests Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {activeFilter === 'all' ? 'All Rental Requests' : 
                         activeFilter === 'pending' ? 'Pending Requests' :
                         activeFilter === 'approved' ? 'Approved Requests' :
                         activeFilter === 'rejected' ? 'Rejected Requests' :
                         'Completed Requests'}
                    </h2>
                    
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Return</th>
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
                                                    {request.contact_number}
                                                </div>
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
                                                    </>
                                                )}
                                            </div>
                                        </td>
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
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Deposit Information</h2>

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
                                                {request.rental?.deposit_amount !== null && request.rental?.deposit_amount !== undefined ?
                                                    `PHP ${request.rental.deposit_amount.toFixed(2)}` :
                                                    'PHP 0.00'
                                                }
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
            </div>
        </AppLayout>
    );
}
