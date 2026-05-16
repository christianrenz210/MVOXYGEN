import React from 'react';
import { Head, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Phone, Package, User, Clock, CheckCircle, XCircle, AlertCircle, Edit, X, DollarSign } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import ConfirmModal from '@/components/confirm-modal';
import AlertModal from '@/components/alert-modal';

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
    billingInfo?: any;
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
    const { rentalRequest, breadcrumbs, auth, billingInfo } = props;

    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [showReceiptModal, setShowReceiptModal] = React.useState(false);
    const [receiptData, setReceiptData] = React.useState<any>(null);
    const [paymentForm, setPaymentForm] = React.useState({
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
    });
    const [paymentError, setPaymentError] = React.useState('');

    // Modal states
    const [showAlertModal, setShowAlertModal] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [alertConfig, setAlertConfig] = React.useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });
    const [confirmConfig, setConfirmConfig] = React.useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
    });

    const formatCurrency = (value: number) => {
        const numValue = isNaN(value) || value === null || value === undefined ? 0 : value;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(numValue);
    };

    const handleOpenPaymentModal = () => {
        if (billingInfo && billingInfo.remaining_balance) {
            setPaymentForm({
                amount: billingInfo.remaining_balance.toString(),
                payment_method: 'cash',
                reference_number: '',
                notes: ''
            });
        }
        setPaymentError('');
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentForm({
            amount: '',
            payment_method: 'cash',
            reference_number: '',
            notes: ''
        });
        setPaymentError('');
    };

    const handlePayment = () => {
        const numAmount = parseFloat(paymentForm.amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setPaymentError('Please enter a valid payment amount');
            return;
        }

        if (billingInfo && numAmount > parseFloat(billingInfo.remaining_balance)) {
            setPaymentError(`Payment amount cannot exceed remaining balance of ${formatCurrency(billingInfo.remaining_balance)}`);
            return;
        }

        router.post(`/user/rentals/${rentalRequest.id}/pay-remaining`, paymentForm, {
            onSuccess: (page) => {
                setShowPaymentModal(false);
                setPaymentForm({
                    amount: '',
                    payment_method: 'cash',
                    reference_number: '',
                    notes: ''
                });
                setPaymentError('');
                
                // Show receipt with transaction ID
                const transactionId = page.props.flash?.transaction_id;
                if (transactionId) {
                    setReceiptData({
                        transactionId,
                        amount: numAmount,
                        paymentMethod: paymentForm.payment_method,
                        referenceNumber: paymentForm.reference_number,
                        date: new Date().toLocaleString(),
                    });
                    setShowReceiptModal(true);
                }
            },
            onError: (errors) => {
                setPaymentError(errors.message || 'Payment failed. Please try again.');
            }
        });
    };

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

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirmModal(true);
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

                        {/* Payment Billing */}
                        {billingInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                            Payment Billing
                                        </div>
                                        {parseFloat(billingInfo.remaining_balance) > 0 && (
                                            <Button
                                                onClick={handleOpenPaymentModal}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Pay Remaining Balance
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`rounded-lg p-4 mb-4 ${
                                        parseFloat(billingInfo.remaining_balance) > 0
                                            ? 'bg-amber-50 border border-amber-200'
                                            : 'bg-emerald-50 border border-emerald-200'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${
                                                parseFloat(billingInfo.remaining_balance) > 0
                                                    ? 'text-amber-800'
                                                    : 'text-emerald-800'
                                            }`}>
                                                {parseFloat(billingInfo.remaining_balance) > 0
                                                    ? 'Remaining Balance'
                                                    : 'Payment Settled'
                                                }
                                            </span>
                                            <span className={`font-bold text-lg ${
                                                parseFloat(billingInfo.remaining_balance) > 0
                                                    ? 'text-amber-900'
                                                    : 'text-emerald-900'
                                            }`}>
                                                {formatCurrency(billingInfo.remaining_balance)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500">Total Cost</p>
                                            <p className="font-semibold">{formatCurrency(billingInfo.total_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Deposit Paid</p>
                                            <p className="font-semibold">{formatCurrency(billingInfo.deposit_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <p className={`font-semibold ${
                                                parseFloat(billingInfo.remaining_balance) > 0
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                            }`}>
                                                {parseFloat(billingInfo.remaining_balance) > 0 ? 'Partial Paid' : 'Fully Paid'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Transaction History */}
                                    {billingInfo.payment_history && billingInfo.payment_history.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="font-semibold text-gray-800 mb-3">Transaction History</h4>
                                            <div className="space-y-2">
                                                {billingInfo.payment_history.map((payment: any, index: number) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-800">₱{parseFloat(payment.amount).toFixed(2)}</p>
                                                                <p className="text-gray-500 text-xs capitalize">{payment.payment_method}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                                                                {payment.transaction_id && (
                                                                    <p className="text-xs font-mono text-gray-600">{payment.transaction_id}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {payment.reference_number && (
                                                            <p className="text-xs text-gray-500">Ref: {payment.reference_number}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                            showConfirm(
                                                'Cancel Rental Request',
                                                'Are you sure you want to cancel this rental request?',
                                                () => {
                                                    router.post(`/user/rentals/${rentalRequest.id}/cancel`, {}, {
                                                        onSuccess: () => {
                                                            router.reload();
                                                        },
                                                        onError: (errors) => {
                                                            if (errors.message && errors.message.includes('CSRF')) {
                                                                showAlert('Error', 'Session expired. Please refresh the page and try again.', 'error');
                                                                window.location.reload();
                                                            } else {
                                                                showAlert('Error', 'Failed to cancel request. Please try again.', 'error');
                                                            }
                                                        }
                                                    });
                                                },
                                                'danger'
                                            );
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

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClosePaymentModal}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                Pay Remaining Balance
                            </h3>
                            <button
                                onClick={handleClosePaymentModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Transaction History */}
                        {billingInfo && billingInfo.payment_history && billingInfo.payment_history.length > 0 && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">Previous Payments</h4>
                                <div className="space-y-2">
                                    {billingInfo.payment_history.map((payment: any, index: number) => (
                                        <div key={index} className="bg-white p-3 rounded border text-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">₱{parseFloat(payment.amount).toFixed(2)}</p>
                                                    <p className="text-gray-500 text-xs capitalize">{payment.payment_method}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                                                    {payment.transaction_id && (
                                                        <p className="text-xs font-mono text-gray-600">{payment.transaction_id}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {payment.reference_number && (
                                                <p className="text-xs text-gray-500">Ref: {payment.reference_number}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {billingInfo && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-amber-800">Remaining Balance:</span>
                                    <span className="font-bold text-amber-900">{formatCurrency(billingInfo.remaining_balance)}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount (₱)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter payment amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.reference_number}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter reference number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Add any notes"
                                />
                            </div>

                            {paymentError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                                    {paymentError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleClosePaymentModal}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Pay Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && receiptData && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                            <p className="text-gray-600">Your payment has been processed successfully</p>
                        </div>

                        {/* Transaction Status */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Transaction Status</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span className="font-mono font-semibold text-gray-800">{receiptData.transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date & Time:</span>
                                    <span className="font-semibold text-gray-800">{receiptData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction Status:</span>
                                    <span className="font-semibold text-green-600">Success</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span className="font-semibold text-green-600">Paid</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-amber-800 mb-2">
                                {billingInfo && parseFloat(billingInfo.remaining_balance) > 0 
                                    ? 'Order Not Yet Fully Paid?'
                                    : 'Order Not Yet Received?'
                                }
                            </p>
                            <p className="text-xs text-amber-700 mb-3">
                                Contact customer service for further assistance regarding your payment
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                                onClick={() => window.location.href = 'mailto:support@mv-oxygen.com'}
                            >
                                Contact Customer Service
                            </Button>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3">Payment Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-bold text-gray-800">{formatCurrency(receiptData.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-semibold text-gray-800 capitalize">{receiptData.paymentMethod}</span>
                                </div>
                                {receiptData.referenceNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reference Number:</span>
                                        <span className="font-semibold text-gray-800">{receiptData.referenceNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    setShowReceiptModal(false);
                                    setReceiptData(null);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
        </AppLayout>
    );
}
