import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Users, Package, Calendar, Phone, MapPin, CheckCircle, AlertCircle, ArrowLeft, Edit, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import AlertModal from '@/components/alert-modal';
import PromptModal from '@/components/prompt-modal';

interface Customer {
    id: number;
    name: string;
    email: string;
}

interface Product {
    id: number;
    name: string;
}

interface Rental {
    id: number;
    status: string;
    pickup_date?: string;
    return_date?: string;
    total_amount?: number;
    notes?: string;
    deposit_type?: string;
    deposit_amount?: number;
    deposit_payment_method?: string;
    deposit_payment_date?: string;
    deposit_status?: string;
    deposit_reference_number?: string;
}

interface RentalRequest {
    id: number;
    customer: Customer;
    product?: Product;
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    contact_number: string;
    address: string;
    delivery_address?: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    admin_notes?: string;
    rejected_reason?: string;
    created_at: string;
    rental?: Rental;
}

interface Props {
    rentalRequest: RentalRequest;
}

export default function RentalShow({ rentalRequest }: Props) {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [depositForm, setDepositForm] = useState({
        amount: '',
        payment_method: 'cash',
        type: 'security',
        reference_number: '',
        notes: ''
    });
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
    });
    const [depositError, setDepositError] = useState('');
    const [paymentError, setPaymentError] = useState('');

    const formatCurrency = (value: number | string | null | undefined) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(Number(value ?? 0));

    const depositAmount = rentalRequest.rental?.deposit_amount ?? 0;
    const totalRentalCost = rentalRequest.rental?.total_amount ?? null;
    const remainingBalance = totalRentalCost !== null ? Math.max(totalRentalCost - depositAmount, 0) : null;
    const depositStatus = rentalRequest.rental?.deposit_status ?? 'pending';

    // Modal states
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [promptConfig, setPromptConfig] = useState({
        title: '',
        message: '',
        placeholder: '',
        onConfirm: (value: string) => {},
        type: 'info' as 'info' | 'warning' | 'danger'
    });
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
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

    const getDepositStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            paid: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-amber-100 text-amber-700',
            refunded: 'bg-sky-100 text-sky-700',
            overdue: 'bg-red-100 text-red-700',
        };
        return badges[status] ?? 'bg-gray-100 text-gray-700';
    };

    const handleApprove = () => {
        handleOpenDepositModal();
    };

    const handleUpdateDeposit = () => {
        if (!rentalRequest.rental) {
            showAlert('Error', 'No rental record found', 'error');
            return;
        }
        if (!validateDepositAmount(depositForm.amount)) {
            return;
        }
        router.post(`/rentals/${rentalRequest.rental.id}/deposit`, {
            amount: depositForm.amount,
            payment_method: depositForm.payment_method,
            deposit_type: depositForm.type,
            reference_number: depositForm.reference_number,
            notes: depositForm.notes,
        }, {
            onSuccess: () => {
                setShowDepositModal(false);
                router.reload();
            }
        });
    };

    const handleApproveWithDeposit = () => {
        if (!validateDepositAmount(depositForm.amount)) {
            return;
        }
        router.post(`/rentals/${rentalRequest.id}/approve`, {
            ...depositForm,
            deposit_amount: depositForm.amount,
            deposit_payment_method: depositForm.payment_method,
            deposit_type: depositForm.type,
            deposit_reference_number: depositForm.reference_number,
        }, {
            onSuccess: () => {
                setShowDepositModal(false);
                router.reload();
            }
        });
    };

    const handleOpenDepositModal = () => {
        // Pre-populate form with existing deposit information if it exists
        if (rentalRequest.rental && rentalRequest.rental.deposit_amount) {
            setDepositForm({
                amount: rentalRequest.rental.deposit_amount.toString(),
                payment_method: rentalRequest.rental.deposit_payment_method || 'cash',
                type: rentalRequest.rental.deposit_type || 'security',
                reference_number: rentalRequest.rental.deposit_reference_number || '',
                notes: ''
            });
        } else {
            setDepositForm({
                amount: '',
                payment_method: 'cash',
                type: 'security',
                reference_number: '',
                notes: ''
            });
        }
        setDepositError('');
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
        setDepositForm({ ...depositForm, amount: value });
        if (value) {
            validateDepositAmount(value);
        } else {
            setDepositError('');
        }
    };

    const handleCloseDepositModal = () => {
        const numAmount = parseFloat(depositForm.amount);
        if (depositForm.amount !== '' && (isNaN(numAmount) || numAmount < 1000)) {
            setDepositError('Please enter a valid deposit amount (minimum ₱1,000) before closing.');
            return;
        }
        setShowDepositModal(false);
        setDepositForm({
            amount: '',
            payment_method: 'cash',
            type: 'security',
            reference_number: '',
            notes: ''
        });
        setDepositError('');
    };

    const handleOpenPaymentModal = () => {
        // Pre-populate with remaining balance
        if (remainingBalance !== null && remainingBalance > 0) {
            setPaymentForm({
                amount: remainingBalance.toString(),
                payment_method: 'cash',
                reference_number: '',
                notes: ''
            });
        } else {
            setPaymentForm({
                amount: '',
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

    const handlePaymentSubmit = () => {
        if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
            setPaymentError('Please enter a valid payment amount');
            return;
        }

        router.post(`/rentals/${rentalRequest.id}/pay-remaining-balance`, {
            amount: parseFloat(paymentForm.amount),
            payment_method: paymentForm.payment_method,
            reference_number: paymentForm.reference_number,
            notes: paymentForm.notes
        }, {
            onSuccess: () => {
                setShowPaymentModal(false);
                router.reload();
            },
            onError: (errors) => {
                setPaymentError(errors.message || 'Payment failed. Please try again.');
            }
        });
    };

    const handleReject = () => {
        showPrompt(
            'Reject Rental Request',
            'Please provide a reason for rejection:',
            'Enter rejection reason...',
            (reason) => {
                router.post(`/rentals/${rentalRequest.id}/reject`, { rejected_reason: reason }, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'danger'
        );
    };

    const handleMarkAsReturned = () => {
        showConfirm(
            'Mark as Returned',
            'Are you sure you want to mark this rental as returned/completed?',
            () => {
                router.post(`/rentals/${rentalRequest.id}/return`, {}, {
                    onSuccess: () => {
                        router.reload();
                    },
                    onError: (errors) => {
                        showAlert('Error', 'Error marking as returned: ' + (errors.message || 'Please try again.'), 'error');
                    }
                });
            },
            'warning'
        );
    };

    const updateNotes = (notes: string) => {
        router.put(`/rentals/${rentalRequest.id}/notes`, { admin_notes: notes }, {
            onSuccess: () => {
                router.reload();
            }
        });
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
        { title: 'Rentals', href: '/rentals' },
        { title: 'Request Details', href: `/rentals/${rentalRequest.id}` }
    ];

    return (
        <AppLayout>
            <Head title="Rental Request Details - Admin" />
            <div className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: '2rem' }}>
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Rental Request Details</h1>
                            <p className="text-gray-600">View and manage rental request information</p>
                        </div>
                        <a
                            href="/rentals"
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Rentals
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-600" />
                                Customer Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-gray-800">{rentalRequest.customer.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-gray-800">{rentalRequest.customer.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                    <p className="text-gray-800 flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {rentalRequest.contact_number}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                                    <p className="text-gray-800 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        {rentalRequest.delivery_address || rentalRequest.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-blue-600" />
                                Rental Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tank Type</label>
                                    <p className="text-gray-800">{rentalRequest.tank_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Quantity</label>
                                    <p className="text-gray-800">{rentalRequest.quantity} unit(s)</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p className="text-gray-800 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {new Date(rentalRequest.start_date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p className="text-gray-800 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {new Date(rentalRequest.end_date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                                    <p className="text-gray-800">{rentalRequest.purpose}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rental Information (if approved) */}
                        {rentalRequest.rental && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Active Rental Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Rental Status</label>
                                        <p className="text-gray-800">{rentalRequest.rental.status}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Pickup Date</label>
                                        <p className="text-gray-800">
                                            {rentalRequest.rental.pickup_date ?
                                                new Date(rentalRequest.rental.pickup_date).toLocaleString() :
                                                'Not set'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Total Amount</label>
                                        <p className="text-gray-800">
                                            {rentalRequest.rental.total_amount ?
                                                `₱${rentalRequest.rental.total_amount}` :
                                                'Not calculated'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Return Date</label>
                                        <p className="text-gray-800">
                                            {rentalRequest.rental.return_date ?
                                                new Date(rentalRequest.rental.return_date).toLocaleString() :
                                                'Not returned'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deposit Information */}
                        {rentalRequest.rental && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                        <span className="w-5 h-5 mr-2 text-blue-600">₱</span>
                                        Deposit Information
                                    </h2>
                                    <div className="flex gap-2">
                                        {rentalRequest.status === 'approved' && (
                                            <button
                                                onClick={handleOpenDepositModal}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Update Deposit
                                            </button>
                                        )}
                                        {remainingBalance !== null && remainingBalance > 0 && (
                                            <button
                                                onClick={handleOpenPaymentModal}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Pay Remaining Balance
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500 w-1/3">Deposit Status</td>
                                            <td className="py-3 px-4 text-gray-800">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getDepositStatusBadge(depositStatus)}`}>
                                                    {depositStatus.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500 w-1/3">Type</td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {rentalRequest.rental.deposit_type === 'cash_on_delivery' ? 'Cash on Delivery' : 
                                                 rentalRequest.rental.deposit_type === 'security' ? 'Security Deposit' : 
                                                 rentalRequest.rental.deposit_type || 'Security Deposit'}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500">Deposit Amount</td>
                                            <td className="py-3 px-4 text-gray-800 font-semibold">
                                                {formatCurrency(rentalRequest.rental.deposit_amount)}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500">Total Rental Cost</td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {totalRentalCost !== null ? formatCurrency(totalRentalCost) : 'Not set'}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500">Remaining Balance</td>
                                            <td className={`py-3 px-4 ${remainingBalance !== null && remainingBalance > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                                                {remainingBalance !== null ? formatCurrency(remainingBalance) : 'Awaiting rental total'}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-medium text-gray-500">Payment Method</td>
                                            <td className="py-3 px-4 text-gray-800">
                                                {rentalRequest.rental.deposit_payment_date ?
                                                    new Date(rentalRequest.rental.deposit_payment_date).toLocaleDateString('en-US', {
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
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 font-medium text-gray-500">Payment Status</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    rentalRequest.rental.deposit_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    rentalRequest.rental.deposit_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {rentalRequest.rental.deposit_status || 'pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {totalRentalCost !== null && (
                                    <div
                                        className={`mt-6 rounded-lg border p-4 text-sm ${
                                            remainingBalance !== null && remainingBalance > 0
                                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                        }`}
                                    >
                                        {remainingBalance !== null && remainingBalance > 0 ? (
                                            <div className="space-y-1">
                                                <p className="font-semibold">Outstanding Balance</p>
                                                <p>The customer still has {formatCurrency(remainingBalance)} to settle for this rental.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="font-semibold">Deposit Settled</p>
                                                <p>The deposit covers the current rental balance. No outstanding payment remains.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status and Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Status & Actions</h2>
                            
                            <div className="mb-6">
                                <label className="text-sm font-medium text-gray-500">Current Status</label>
                                <div className="mt-2">
                                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(rentalRequest.status)}`}>
                                        {rentalRequest.status}
                                    </span>
                                </div>
                            </div>

                            {rentalRequest.status === 'pending' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleApprove}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Request
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        Reject Request
                                    </button>
                                </div>
                            )}

                            {rentalRequest.status === 'approved' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleMarkAsReturned}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as Returned/Completed
                                    </button>
                                </div>
                            )}

                            {rentalRequest.status === 'rejected' && rentalRequest.rejected_reason && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <label className="text-sm font-medium text-red-800">Rejection Reason</label>
                                    <p className="text-red-700 mt-1">{rentalRequest.rejected_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Admin Notes */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Edit className="w-5 h-5 mr-2 text-blue-600" />
                                Admin Notes
                            </h2>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Add notes about this rental request..."
                                defaultValue={rentalRequest.admin_notes || ''}
                                onBlur={(e) => updateNotes(e.target.value)}
                            />
                        </div>

                        {/* Request Information */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Request Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Request ID</label>
                                    <p className="text-gray-800">#{rentalRequest.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted On</label>
                                    <p className="text-gray-800">
                                        {new Date(rentalRequest.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => {
                    // Prevent closing when clicking outside if deposit is invalid
                    const numAmount = parseFloat(depositForm.amount);
                    if (depositForm.amount !== '' && (isNaN(numAmount) || numAmount < 1000)) {
                        e.stopPropagation();
                        setDepositError('Please enter a valid deposit amount (minimum ₱1,000) before closing.');
                    }
                }}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <span className="w-5 h-5 mr-2 text-blue-600">₱</span>
                                Deposit Information
                            </h3>
                            <button
                                onClick={handleCloseDepositModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Balance Information */}
                            {totalRentalCost !== null && (
                                <div className={`rounded-lg border p-3 ${
                                    remainingBalance !== null && remainingBalance > 0
                                        ? 'border-amber-200 bg-amber-50'
                                        : 'border-emerald-200 bg-emerald-50'
                                }`}>
                                    <p className={`text-sm font-medium mb-2 ${
                                        remainingBalance !== null && remainingBalance > 0
                                            ? 'text-amber-800'
                                            : 'text-emerald-800'
                                    }`}>
                                        {remainingBalance !== null && remainingBalance > 0
                                            ? 'Remaining Balance'
                                            : 'Payment Status'
                                        }
                                    </p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Rental Cost:</span>
                                            <span className="font-semibold">{formatCurrency(totalRentalCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current Deposit:</span>
                                            <span className="font-semibold">{formatCurrency(depositAmount)}</span>
                                        </div>
                                        <div className={`flex justify-between font-bold ${
                                            remainingBalance !== null && remainingBalance > 0
                                                ? 'text-amber-700'
                                                : 'text-emerald-700'
                                        }`}>
                                            <span>Remaining Balance:</span>
                                            <span>{remainingBalance !== null ? formatCurrency(remainingBalance) : '₱0.00'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800 font-medium">
                                    Minimum deposit: ₱1,000
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={depositForm.payment_method}
                                    onChange={(e) => setDepositForm({ ...depositForm, payment_method: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="cash_on_delivery">Cash on Delivery</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Type</label>
                                <select
                                    value={depositForm.type || 'security'}
                                    onChange={(e) => setDepositForm({ ...depositForm, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="security">Security Deposit</option>
                                    <option value="cash_on_delivery">Cash on Delivery</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={depositForm.amount}
                                    onChange={(e) => handleDepositAmountChange(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        depositError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                    min="1000"
                                />
                                {depositError && (
                                    <p className="text-red-500 text-sm mt-1">{depositError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={new Date().toISOString().split('T')[0]}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (Optional)</label>
                                <input
                                    type="text"
                                    value={depositForm.reference_number}
                                    onChange={(e) => setDepositForm({ ...depositForm, reference_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={depositForm.notes}
                                    onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseDepositModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={rentalRequest.status === 'pending' ? handleApproveWithDeposit : handleUpdateDeposit}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!depositForm.amount || parseFloat(depositForm.amount) < 1000}
                                >
                                    {rentalRequest.status === 'pending' ? 'Approve with Deposit' : 'Update Deposit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal for Remaining Balance */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                <span className="w-5 h-5 mr-2 text-green-600">₱</span>
                                Pay Remaining Balance
                            </h3>
                            <button
                                onClick={handleClosePaymentModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Balance Information */}
                            {totalRentalCost !== null && (
                                <div className={`rounded-lg border p-3 ${
                                    remainingBalance !== null && remainingBalance > 0
                                        ? 'border-amber-200 bg-amber-50'
                                        : 'border-emerald-200 bg-emerald-50'
                                }`}>
                                    <p className={`text-sm font-medium mb-2 ${
                                        remainingBalance !== null && remainingBalance > 0
                                            ? 'text-amber-800'
                                            : 'text-emerald-800'
                                    }`}>
                                        Payment Summary
                                    </p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Rental Cost:</span>
                                            <span className="font-semibold">{formatCurrency(totalRentalCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Current Deposit:</span>
                                            <span className="font-semibold">{formatCurrency(depositAmount)}</span>
                                        </div>
                                        <div className={`flex justify-between font-bold ${
                                            remainingBalance !== null && remainingBalance > 0
                                                ? 'text-amber-700'
                                                : 'text-emerald-700'
                                        }`}>
                                            <span>Remaining Balance:</span>
                                            <span>{remainingBalance !== null ? formatCurrency(remainingBalance) : '₱0.00'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        paymentError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                    min="0"
                                />
                                {paymentError && (
                                    <p className="text-red-500 text-sm mt-1">{paymentError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentForm.reference_number}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter reference number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleClosePaymentModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePaymentSubmit}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                                >
                                    Pay Now
                                </button>
                            </div>
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
