import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Clock, CheckCircle, AlertCircle, XCircle, PlusCircle, ArrowLeft, Trash2, Wrench, Warehouse } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { router } from '@inertiajs/react';

interface RentalRequest {
    id: number;
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    updated_at: string;
    contact_number?: string;
    address?: string;
    rental?: {
        id: number;
        status: string;
        pickup_date?: string;
        return_date?: string;
        notes?: string;
    };
    assigned_tank?: {
        tank_id: string;
        tank_type: string;
        quantity: number;
        status: string;
        last_refilled?: string;
    };
    maintenance?: {
        tank_type: string;
        quantity: number;
        condition: string;
        valve: string;
    };
}

interface Stats {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    completed_requests: number;
}

interface PageProps {
    rentalRequests: RentalRequest[];
    stats: Stats;
    breadcrumbs: BreadcrumbItem[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    [key: string]: any; // Add index signature for Inertia
}

export default function UserHistory() {
    const { props } = usePage<PageProps>();
    const { rentalRequests, stats, breadcrumbs, auth } = props;
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    
    // Debug: Check if breadcrumbs are received
    console.log('History page breadcrumbs:', breadcrumbs);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'pending':
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} days`;
    };

    const handleCreateRequest = () => {
        router.visit('/user/rentals/create');
    };

    const handleViewDetails = (id: number) => {
        router.visit(`/user/rentals/${id}`);
    };

    return (
        <AppLayout>
            <Head title="Rental History" />

            <div className="w-full p-6 space-y-6">
                {/* Breadcrumbs at the bottom */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Rental History</h1>
                        <p className="text-gray-600">View your complete rental request history</p>
                    </div>
                    {rentalRequests.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowClearConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear History
                        </Button>
                    )}
                </div>

                

                {/* History List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Complete History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rentalRequests.length > 0 ? (
                            <div className="space-y-4">
                                {rentalRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                                        onClick={() => handleViewDetails(request.id)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    request.status === 'approved' ? 'bg-green-500' :
                                                    request.status === 'rejected' ? 'bg-red-500' :
                                                    request.status === 'completed' ? 'bg-blue-500' :
                                                    'bg-yellow-500'
                                                }`}></div>
                                                <div>
                                                    <span className="font-medium text-gray-800">{request.tank_type}</span>
                                                    <Badge className={`ml-2 ${getStatusColor(request.status)}`}>
                                                        {getStatusIcon(request.status)}
                                                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Request #{request.id}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">Duration</div>
                                                    <div className="text-xs">{calculateDuration(request.start_date, request.end_date)}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">Quantity</div>
                                                    <div className="text-xs">{request.quantity} unit(s)</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">Requested</div>
                                                    <div className="text-xs">{formatDate(request.created_at)}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                                                <div>
                                                    <div className="font-medium">Updated</div>
                                                    <div className="text-xs">{formatDate(request.updated_at)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inventory and Inspection Details */}
                                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {request.assigned_tank && (
                                                <div className="flex items-center text-gray-600">
                                                    <Warehouse className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium">Inventory Quantity</div>
                                                        <div className="text-xs">{request.assigned_tank.quantity} available</div>
                                                    </div>
                                                </div>
                                            )}
                                            {request.maintenance && (
                                                <div className="flex items-center text-gray-600">
                                                    <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium">Inspection Details</div>
                                                        <div className="text-xs">Condition: {request.maintenance.condition}, Valve: {request.maintenance.valve}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                Purpose: {request.purpose}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No rental requests yet</p>
                                <p className="text-sm mb-4">Create your first rental request to get started</p>
                                <Button onClick={handleCreateRequest}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Create Your First Request
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Clear History Confirmation Modal */}
                {showClearConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Clear Rental History?</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-800">
                                    This will permanently delete all your <strong>completed, rejected, and cancelled</strong> rental requests.
                                </p>
                                <p className="text-sm text-red-700 mt-2">
                                    <strong>Pending and approved requests will not be affected.</strong>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClearConfirm(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        router.post('/user/history/clear', {}, {
                                            onSuccess: () => {
                                                setShowClearConfirm(false);
                                                router.reload();
                                            }
                                        });
                                    }}
                                    className="flex-1"
                                >
                                    Clear History
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
