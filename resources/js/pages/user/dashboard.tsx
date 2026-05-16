import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { Package, Calendar, CheckCircle, AlertCircle, Clock, PlusCircle, History, TrendingUp, MapPin, X, DollarSign } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import DeliveryTrackingMap from '@/components/delivery-tracking-map';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const useScrollAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return [ref, isVisible] as const;
};

interface RentalRequest {
    id: number;
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_transit' | 'delivered';
    created_at: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    delivery_lat?: number;
    delivery_lng?: number;
    delivery_address?: string;
    pickup_lat?: number;
    pickup_lng?: number;
    pickup_address?: string;
    assigned_tank_id?: string;
}

interface ActiveRental {
    id: number;
    tank_id: string;
    start_date: string;
    end_date: string;
    status: string;
    pickup_date?: string;
    rental_request?: RentalRequest;
    delivery_lat?: number;
    delivery_lng?: number;
    delivery_address?: string;
    pickup_lat?: number;
    pickup_lng?: number;
    pickup_address?: string;
}

interface Stats {
    pending_requests: number;
    approved_requests: number;
    active_rentals: number;
    completed_rentals: number;
}

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    rentalRequests: RentalRequest[];
    activeRentals: ActiveRental[];
    stats: Stats;
    tankTypes: string[];
    billingInfo?: any[];
    totalOutstandingBalance?: number;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function UserDashboard({ breadcrumbs = [{ title: 'Dashboard', href: '/user/dashboard' }], rentalRequests, activeRentals, stats, tankTypes, billingInfo = [], totalOutstandingBalance = 0, auth }: Props) {
    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        request_type: 'rental',
        tank_type: '',
        purpose: '',
        purpose_other: '',
        contact_number: '',
        address: '',
        pickup_type: 'delivery'
    });

    const [headerRef, headerVisible] = useScrollAnimation();
    const [statsRef, statsVisible] = useScrollAnimation();
    const [quickActionsRef, quickActionsVisible] = useScrollAnimation();
    const [activeRentalsRef, activeRentalsVisible] = useScrollAnimation();
    const [rentalHistoryRef, rentalHistoryVisible] = useScrollAnimation();

    const getAutoPurpose = (tankType: string): string => {
        const lowerTankType = tankType.toLowerCase();
        if (lowerTankType.includes('medical') || lowerTankType.includes('oxygen')) {
            return 'Medical Use';
        } else if (lowerTankType.includes('industrial')) {
            return 'Industrial Use';
        } else if (lowerTankType.includes('welding') || lowerTankType.includes('argon') || lowerTankType.includes('acetylene')) {
            return 'Welding';
        } else if (lowerTankType.includes('construction')) {
            return 'Construction';
        } else if (lowerTankType.includes('laboratory') || lowerTankType.includes('nitro')) {
            return 'Laboratory';
        } else {
            return 'Others';
        }
    };

    const handleCreateRequest = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setFormData({
            request_type: 'rental',
            tank_type: '',
            purpose: '',
            purpose_other: '',
            contact_number: '',
            address: '',
            pickup_type: 'delivery'
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'tank_type' && value !== formData.tank_type) {
            setFormData(prev => ({
                ...prev,
                contact_number: '',
                address: '',
                purpose: getAutoPurpose(value),
                purpose_other: ''
            }));
        }
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine purpose and purpose_other if "Others" is selected
        const submitData = {
            ...formData,
            purpose: formData.purpose === 'Others' ? formData.purpose_other : formData.purpose
        };

        router.post('/user/rentals', submitData, {
            onSuccess: () => {
                handleCloseModal();
                setShowSuccessModal(true);
            },
            onError: (errors) => {
                console.error('Error creating request:', errors);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="User Dashboard" />
            <div className="min-h-screen bg-background p-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>

                    {/* Header */}
                    <div ref={headerRef} className={`mb-8 ${headerVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {auth.user.name}!</h1>
                        <p className="text-muted-foreground">Welcome to MV Oxygen Trading - Manage your rentals</p>
                    </div>

                    {/* Stats Cards */}
                <div ref={statsRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${statsVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 dark:shadow-xl dark:border-yellow-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
                                <p className="text-2xl font-bold text-foreground">{stats.pending_requests}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-green-500 dark:shadow-xl dark:border-green-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Active Rentals</p>
                                <p className="text-2xl font-bold text-foreground">{stats.active_rentals}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-blue-500 dark:shadow-xl dark:border-blue-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Approved Requests</p>
                                <p className="text-2xl font-bold text-foreground">{stats.approved_requests}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-lg p-6 border-l-4 border-purple-500 dark:shadow-xl dark:border-purple-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold text-foreground">{stats.completed_rentals}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div ref={quickActionsRef} className={`bg-card rounded-xl shadow-lg p-6 mb-8 dark:shadow-xl ${quickActionsVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/user/rentals/create"
                            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            New Request
                        </a>
                        <a
                            href="/user/rentals"
                            className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <History className="w-5 h-5 mr-2" />
                            View All Rentals
                        </a>
                    </div>
                </div>

                {/* Payment Billing */}
                {billingInfo && billingInfo.length > 0 && (
                    <div className={`bg-card rounded-xl shadow-lg p-6 mb-8 dark:shadow-xl ${quickActionsVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Payment Billing
                        </h2>
                        
                        <div className={`mb-4 p-4 rounded-lg ${
                            totalOutstandingBalance && totalOutstandingBalance > 0
                                ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                                : 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${
                                    totalOutstandingBalance && totalOutstandingBalance > 0
                                        ? 'text-amber-800 dark:text-amber-200'
                                        : 'text-emerald-800 dark:text-emerald-200'
                                }`}>
                                    {totalOutstandingBalance && totalOutstandingBalance > 0
                                        ? 'Total Outstanding Balance'
                                        : 'All Payments Settled'
                                    }
                                </span>
                                <span className={`font-bold text-lg ${
                                    totalOutstandingBalance && totalOutstandingBalance > 0
                                        ? 'text-amber-900 dark:text-amber-100'
                                        : 'text-emerald-900 dark:text-emerald-100'
                                }`}>
                                    ₱{(parseFloat(totalOutstandingBalance) || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {billingInfo.map((billing, index) => (
                                <Link 
                                    key={index} 
                                    href={`/user/rentals/${billing.rental_request_id}`}
                                    className="block border border-border rounded-lg p-4 hover:shadow-md transition-shadow hover:bg-accent/50"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{billing.tank_type}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Pickup: {billing.pickup_date ? new Date(billing.pickup_date).toLocaleDateString() : 'Not set'}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            billing.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                                        }`}>
                                            {billing.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm pt-3 border-t border-border">
                                        <div>
                                            <p className="text-muted-foreground">Total Cost</p>
                                            <p className="font-medium text-foreground">₱{(parseFloat(billing.total_amount) || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Deposit Paid</p>
                                            <p className="font-medium text-foreground">₱{(parseFloat(billing.deposit_amount) || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Remaining Balance</p>
                                            <p className={`font-medium ${
                                                billing.remaining_balance > 0
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                                ₱{(parseFloat(billing.remaining_balance) || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Rentals */}
                {activeRentals.length > 0 && (
                    <div ref={activeRentalsRef} className={`bg-card rounded-xl shadow-lg p-6 mb-8 dark:shadow-xl ${activeRentalsVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-green-600" />
                            Active Rentals
                        </h2>
                        <div className="space-y-4">
                            {activeRentals.map((rental) => {
                                const isTrackable = ['approved', 'in_transit', 'delivered'].includes(rental.rental_request?.status);
                                return (
                                    <div key={rental.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <span className="font-semibold text-foreground">
                                                        {rental.rental_request?.tank_type || 'Oxygen Tank'}
                                                    </span>
                                                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                                        Active
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground/60" />
                                                        <div>
                                                            <div className="font-medium text-foreground/90">Rental Period</div>
                                                            <div className="text-xs text-foreground/80">{new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Package className="w-4 h-4 mr-2 text-muted-foreground/60" />
                                                        <div>
                                                            <div className="font-medium text-foreground/90">Tank ID</div>
                                                            <div className="text-xs text-foreground/80 truncate">
                                                                {rental.tank_id || rental.rental_request?.assigned_tank_id || 'TBD'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground font-medium">
                                                {rental.pickup_date ? `Picked up: ${new Date(rental.pickup_date).toLocaleDateString()}` : 'Ready for pickup'}
                                            </div>
                                        </div>
                                        
                                        {/* Tracking Section */}
                                        {isTrackable && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-foreground flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                                        Track Your Delivery
                                                    </h3>
                                                    <a
                                                        href={`/user/rentals/${rental.rental_request?.id}/track`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                                    >
                                                        View Live Tracking
                                                        <MapPin className="w-3 h-3 ml-1" />
                                                    </a>
                                                </div>

                                                {/* Mini Map Preview */}
                                                <div className="h-32 w-full rounded-lg overflow-hidden border border-border relative" style={{ zIndex: 0 }}>
                                                    <div className="absolute inset-0" style={{ zIndex: 0 }}>
                                                        <DeliveryTrackingMap
                                                            deliveryLocation={
                                                                rental.rental_request?.delivery_address ? {
                                                                    lat: rental.rental_request.delivery_lat,
                                                                    lng: rental.rental_request.delivery_lng,
                                                                    address: rental.rental_request.delivery_address
                                                                } : undefined
                                                            }
                                                            pickupLocation={
                                                                rental.rental_request?.pickup_address ? {
                                                                    lat: rental.rental_request.pickup_lat,
                                                                    lng: rental.rental_request.pickup_lng,
                                                                    address: rental.rental_request.pickup_address
                                                                } : undefined
                                                            }
                                                            currentLocation={undefined}
                                                            isDelivered={rental.rental_request?.status === 'delivered'}
                                                            className="h-32 w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rental History */}
                <div ref={rentalHistoryRef} className={`bg-card rounded-xl shadow-lg p-6 dark:shadow-xl ${rentalHistoryVisible ? 'animate-in fade-in slide-in-from-bottom-4 duration-1000' : 'opacity-0'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-foreground flex items-center">
                            <History className="w-5 h-5 mr-2 text-purple-600" />
                            Rental History
                        </h2>
                        <a href="/user/rentals" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View All
                        </a>
                    </div>
                    
                    <div className="space-y-4">
                        {rentalRequests.length > 0 ? (
                            rentalRequests.map((request) => (
                                <div 
                                    key={request.id} 
                                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30 dark:bg-card/50 dark:hover:bg-card/70"
                                    onClick={() => router.visit(`/user/rentals/${request.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                request.status === 'approved' ? 'bg-green-500 dark:bg-green-400' :
                                                request.status === 'rejected' ? 'bg-red-500 dark:bg-red-400' :
                                                request.status === 'completed' ? 'bg-blue-500 dark:bg-blue-400' :
                                                'bg-yellow-500 dark:bg-yellow-400'
                                            }`}></div>
                                            <div>
                                                <span className="font-semibold text-foreground">{request.tank_type}</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusBadge(request.status)}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Request #{request.id}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground/60" />
                                            <div>
                                                <div className="font-medium text-foreground/90">Rental Period</div>
                                                <div className="text-xs text-foreground/80">{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Package className="w-4 h-4 mr-2 text-muted-foreground/60" />
                                            <div>
                                                <div className="font-medium text-foreground/90">Quantity</div>
                                                <div className="text-xs text-foreground/80">{request.quantity} unit(s)</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-2 text-muted-foreground/60" />
                                            <div>
                                                <div className="font-medium text-foreground/90">Requested</div>
                                                <div className="text-xs text-foreground/80">{new Date(request.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground/90">Purpose:</span> {request.purpose}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                                <p>No rental requests yet.</p>
                                <button
                                    onClick={handleCreateRequest}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Your First Request
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Request Modal */}
            {showCreateModal && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">New Rental Request</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                                <select
                                    name="request_type"
                                    value={formData.request_type}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="rental">New Rental</option>
                                    <option value="refill">Refill</option>
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
                                    {tankTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                <select
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Purpose</option>
                                    <option value="Medical Use">Medical Use</option>
                                    <option value="Industrial Use">Industrial Use</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Welding">Welding</option>
                                    <option value="Laboratory">Laboratory</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            {formData.purpose === 'Others' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Please Specify</label>
                                    <textarea
                                        name="purpose_other"
                                        value={formData.purpose_other}
                                        onChange={handleFormChange}
                                        placeholder="Describe the purpose of your request"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleFormChange}
                                    placeholder="Enter your contact number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Type</label>
                                <select
                                    name="pickup_type"
                                    value={formData.pickup_type}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="delivery">Delivery</option>
                                    <option value="pickup">Pickup at Store</option>
                                </select>
                            </div>

                            {formData.pickup_type === 'delivery' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleFormChange}
                                        placeholder="Enter your delivery address"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required={formData.pickup_type === 'delivery'}
                                    />
                                </div>
                            )}

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
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Success Modal */}
            {showSuccessModal && createPortal(
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div
                        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h3>
                            <p className="text-gray-600 mb-6">Your rental request has been submitted and is now pending approval.</p>
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
