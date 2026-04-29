import React from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Phone, Package, User, Clock, CheckCircle, XCircle, AlertCircle, Edit, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface RentalRequest {
    id: number;
    request_type: string;
    tank_type: string;
    assigned_tank_id?: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    contact_number: string;
    address: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    admin_notes?: string;
    rejected_reason?: string;
    created_at: string;
    updated_at: string;
    rental?: {
        id: number;
        status: string;
        notes?: string;
        created_at: string;
    };
}

interface PageProps {
    rentalRequest: RentalRequest;
    breadcrumbs: BreadcrumbItem[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function RentalShow() {
    const { props } = usePage<PageProps>();
    const { rentalRequest, breadcrumbs, auth } = props;
    
    // Debug: Check if breadcrumbs are received
    console.log('Breadcrumbs:', breadcrumbs);
    console.log('Props:', props);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
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
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rental Request #${rentalRequest.id}`} />

            <div className="w-full p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Rental Request Details
                            </h1>
                            <p className="text-sm text-gray-500">
                                Request #{rentalRequest.id}
                            </p>
                        </div>
                    </div>
                    <Badge className={`flex items-center gap-2 ${getStatusColor(rentalRequest.status)}`}>
                        {getStatusIcon(rentalRequest.status)}
                        {rentalRequest.status.charAt(0).toUpperCase() + rentalRequest.status.slice(1)}
                    </Badge>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Request Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tank Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Tank Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Request Type</label>
                                        <p className="text-lg font-semibold capitalize">{rentalRequest.request_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tank Type</label>
                                        <p className="text-lg font-semibold">{rentalRequest.tank_type}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Quantity</label>
                                        <p className="text-lg font-semibold">{rentalRequest.quantity}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tank ID</label>
                                        <p className="text-lg font-semibold">
                                            {rentalRequest.assigned_tank_id ? (
                                                <span className="text-blue-600">{rentalRequest.assigned_tank_id}</span>
                                            ) : (
                                                <span className="text-gray-400">TBD</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                                    <p className="text-gray-900">{rentalRequest.purpose}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rental Period */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Rental Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                                        <p className="text-lg font-semibold">{formatDate(rentalRequest.start_date)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">End Date</label>
                                        <p className="text-lg font-semibold">{formatDate(rentalRequest.end_date)}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Duration: {Math.ceil((new Date(rentalRequest.end_date).getTime() - new Date(rentalRequest.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                        <p className="text-gray-900">{rentalRequest.contact_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                                        <p className="text-gray-900">{rentalRequest.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Notes (if any) */}
                        {(rentalRequest.admin_notes || rentalRequest.rejected_reason) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {rentalRequest.rejected_reason ? (
                                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                                            <p className="text-red-700">{rentalRequest.rejected_reason}</p>
                                        </div>
                                    ) : rentalRequest.admin_notes ? (
                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700">{rentalRequest.admin_notes}</p>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Request Submitted</p>
                                        <p className="text-xs text-gray-500">{formatDate(rentalRequest.created_at)}</p>
                                    </div>
                                </div>
                                {rentalRequest.updated_at !== rentalRequest.created_at && (
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            rentalRequest.status === 'approved' ? 'bg-green-500' : 
                                            rentalRequest.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {rentalRequest.status === 'approved' ? 'Request Approved' : 
                                                 rentalRequest.status === 'rejected' ? 'Request Rejected' : 
                                                 'Status Updated'}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(rentalRequest.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {rentalRequest.rental && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="text-sm font-medium">Rental Active</p>
                                            <p className="text-xs text-gray-500">{formatDate(rentalRequest.rental.created_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {rentalRequest.status === 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full flex items-center gap-2"
                                        onClick={() => window.location.href = `/user/rentals/${rentalRequest.id}/edit`}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Request
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full flex items-center gap-2"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to cancel this rental request?')) {
                                                router.post(`/user/rentals/${rentalRequest.id}/cancel`, {}, {
                                                    onSuccess: () => {
                                                        router.reload();
                                                    },
                                                    onError: (errors) => {
                                                        if (errors.message && errors.message.includes('CSRF')) {
                                                            alert('Session expired. Please refresh the page and try again.');
                                                            window.location.reload();
                                                        } else {
                                                            alert('Failed to cancel request. Please try again.');
                                                        }
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel Request
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => window.location.href = '/user/rentals/create'}
                                    >
                                        Create New Request
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
