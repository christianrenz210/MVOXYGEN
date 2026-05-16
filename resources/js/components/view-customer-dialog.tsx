import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, Package, X, DollarSign, AlertCircle } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    contact_number: string;
    address: string;
    delivery_address?: string;
    status: 'active' | 'inactive' | 'archived';
    total_rentals: number;
    created_at: string;
    updated_at?: string;
    recent_transactions?: any[];
    billing_info?: any[];
    total_outstanding_balance?: number;
    profile_image?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        role?: string;
        profile_image?: string;
        status?: string;
        updated_at?: string;
    };
}

interface ViewCustomerDialogProps {
    customer: Customer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViewCustomerDialog({ customer, open, onOpenChange }: ViewCustomerDialogProps) {
    console.log('ViewCustomerDialog - customer:', customer);
    console.log('Profile image check:', {
        'customer.profile_image': customer.profile_image,
        'customer.user?.profile_image': customer.user?.profile_image,
        'customer.updated_at': customer.updated_at
    });

    const getStatusBadge = (status: string) => {
        const badges = {
            active: 'bg-green-100 text-green-800 hover:bg-green-200',
            archived: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
            inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                    <DialogDescription>
                        View detailed information about this customer including their contact details, rental history, and account status.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pb-6">
                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-3">
                                    {(customer.profile_image || customer.user?.profile_image) ? (
                                        <img 
                                            src={`/storage/${customer.profile_image || customer.user?.profile_image}?v=${Date.now()}`} 
                                            alt={customer.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Image load error:', e.currentTarget.src);
                                                console.error('Customer data:', customer);
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                            onLoad={() => {
                                                console.log('Image loaded successfully');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl ${(customer.user?.profile_image || customer.profile_image) ? 'hidden' : ''}`}>
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <Badge 
                                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                        customer.status === 'active' ? 'bg-green-100 text-green-800' :
                                        customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }
                                >
                                    {customer.status}
                                </Badge>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer ID</label>
                                    <p className="text-gray-800">#{customer.id.toString().padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-gray-800">{customer.name}</p>
                                </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                <div className="flex items-center text-gray-800">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    {customer.contact_number}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                                <div className="flex items-start text-gray-800 mt-1">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 shrink-0" />
                                    <span>{customer.delivery_address || customer.address}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Rentals</label>
                                <p className="text-gray-800">{customer.total_rentals}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Member Since</label>
                                <div className="flex items-center text-gray-800">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* User Account Information */}
                    {customer.user && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4">User Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">User ID</label>
                                    <p className="text-gray-800">#{customer.user.id.toString().padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-gray-800">{customer.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-gray-800">{customer.user.phone || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-gray-800">{customer.user.role || 'customer'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Billing / Outstanding Balances */}
                    {customer.billing_info && customer.billing_info.length > 0 && (
                        <div className={`rounded-lg p-4 ${
                            customer.total_outstanding_balance && parseFloat(customer.total_outstanding_balance) > 0
                                ? 'bg-amber-50 border border-amber-200'
                                : 'bg-emerald-50 border border-emerald-200'
                        }`}>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="h-5 w-5 mr-2 font-bold">₱</span>
                                Payment Billing
                            </h3>
                            
                            <div className={`mb-4 p-3 rounded-lg ${
                                customer.total_outstanding_balance && parseFloat(customer.total_outstanding_balance) > 0
                                    ? 'bg-amber-100'
                                    : 'bg-emerald-100'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium ${
                                        customer.total_outstanding_balance && parseFloat(customer.total_outstanding_balance) > 0
                                            ? 'text-amber-800'
                                            : 'text-emerald-800'
                                    }`}>
                                        {customer.total_outstanding_balance && parseFloat(customer.total_outstanding_balance) > 0
                                            ? 'Total Outstanding Balance'
                                            : 'All Payments Settled'
                                        }
                                    </span>
                                    <span className={`font-bold text-lg ${
                                        customer.total_outstanding_balance && parseFloat(customer.total_outstanding_balance) > 0
                                            ? 'text-amber-900'
                                            : 'text-emerald-900'
                                    }`}>
                                        ₱{(parseFloat(customer.total_outstanding_balance) || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {customer.billing_info.map((billing, index) => (
                                    <div key={index} className="bg-white p-3 rounded border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{billing.tank_type}</p>
                                                <p className="text-sm text-gray-500">
                                                    Pickup: {billing.pickup_date ? new Date(billing.pickup_date).toLocaleDateString() : 'Not set'}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <Badge 
                                                    variant={billing.status === 'approved' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {billing.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm mt-2 pt-2 border-t">
                                            <div>
                                                <p className="text-gray-500">Total Cost</p>
                                                <p className="font-medium">₱{(parseFloat(billing.total_amount) || 0).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Deposit</p>
                                                <p className="font-medium">₱{(parseFloat(billing.deposit_amount) || 0).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Remaining</p>
                                                <p className={`font-bold ${
                                                    parseFloat(billing.remaining_balance) > 0
                                                        ? 'text-amber-600'
                                                        : 'text-emerald-600'
                                                }`}>
                                                    ₱{(parseFloat(billing.remaining_balance) || 0).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    {customer.recent_transactions && customer.recent_transactions.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Recent Transactions
                            </h3>
                            <div className="space-y-2">
                                {customer.recent_transactions.map((transaction, index) => (
                                    <div key={transaction.id} className="bg-white p-3 rounded border">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{transaction.tank_id}</p>
                                                <p className="text-sm text-gray-500">{transaction.transaction_type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                                </p>
                                                <Badge 
                                                    variant={transaction.transaction_type === 'Rent' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {transaction.transaction_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
