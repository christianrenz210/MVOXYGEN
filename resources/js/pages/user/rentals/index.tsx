import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, Calendar, Eye, PlusCircle, Clock, CheckCircle, AlertCircle, History, MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface RentalRequest {
    id: number;
    tank_type: string;
    assigned_tank_id?: string;
    quantity?: number;
    start_date?: string;
    end_date?: string;
    purpose: string;
    contact_number: string;
    address?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_transit' | 'delivered';
    admin_notes?: string;
    rejected_reason?: string;
    created_at: string;
    delivery_address?: string;
    pickup_address?: string;
    rental?: {
        id: number;
        tank_id: string;
        pickup_date?: string;
        return_date?: string;
        status: string;
    };
}

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    rentalRequests: RentalRequest[];
}

export default function UserRentalIndex({ breadcrumbs = [{ title: 'Dashboard', href: '/user/dashboard' }], rentalRequests }: Props) {
    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-orange-100 text-orange-800',
            delivered: 'bg-purple-100 text-purple-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: Clock,
            approved: CheckCircle,
            rejected: AlertCircle,
            completed: History,
            in_transit: Package,
            delivered: CheckCircle
        };
        return icons[status as keyof typeof icons] || Package;
    };

    const handleCreateNew = () => {
        router.visit('/user/rentals/create');
    };

    const breadcrumbsWithIndex: BreadcrumbItem[] = [
        ...breadcrumbs,
        { title: 'My Rentals', href: '/user/rentals' }
    ];

    return (
        <AppLayout>
            <Head title="My Rentals" />
            <div className="min-h-screen bg-gray-50 p-6 w-full">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbsWithIndex} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Rentals</h1>
                            <p className="text-gray-600">View and manage your rental requests</p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            New Request
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
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

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">In Transit</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'in_transit').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Delivered</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {rentalRequests.filter(r => r.status === 'delivered').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
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
                </div>

                {/* Rental Requests Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">All Rental Requests</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tank ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Purpose</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalRequests.map((request) => {
                                    const StatusIcon = getStatusIcon(request.status);
                                    const isTrackable = ['approved', 'in_transit', 'delivered'].includes(request.status);
                                    const pickupType = request.delivery_address ? 'Delivery' : 'Pickup';
                                    return (
                                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">{request.tank_type}</td>
                                            <td className="py-3 px-4">
                                                {request.assigned_tank_id ? (
                                                    <span className="text-blue-600 font-medium">{request.assigned_tank_id}</span>
                                                ) : (
                                                    <span className="text-gray-400">TBD</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                                    {pickupType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-800 max-w-xs truncate" title={request.purpose}>
                                                {request.purpose}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <a
                                                        href={`/user/rentals/${request.id}`}
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </a>
                                                    {isTrackable && (
                                                        <a
                                                            href={`/user/rentals/${request.id}/track`}
                                                            className="text-green-600 hover:text-green-800 flex items-center"
                                                            title="Track Delivery"
                                                        >
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            Track
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {rentalRequests.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No rental requests found.</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Your First Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
