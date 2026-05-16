import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Package, Calendar, MapPin, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

interface Props {
    breadcrumbs?: BreadcrumbItem[];
    approved_rental_requests?: string[];
    tankTypes?: { type: string; price: number; quantity: number; image?: string | null }[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function RentalRequestCreate({ breadcrumbs = [{ title: 'Dashboard', href: '/user/dashboard' }], approved_rental_requests = [], tankTypes = [], flash }: Props) {
    const [formData, setFormData] = useState({
        request_type: 'rental',
        tank_types: [''],
        purpose: '',
        purpose_other: '',
        contact_number: '',
        location: 'General Tinio, Nueva Ecija',
        barangay: '',
        street: '',
        house_number: '',
        landmark: '',
        pickup_type: 'delivery',
        priority: 'normal'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Show success modal if there's a success message from backend
    useEffect(() => {
        if (flash?.success) {
            setShowSuccessModal(true);
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Remove address fields if pickup type is selected
        const submitData: any = { ...formData };
        if (submitData.pickup_type === 'pickup') {
            delete submitData.location;
            delete submitData.barangay;
            delete submitData.street;
            delete submitData.house_number;
            delete submitData.landmark;
        } else {
            // Combine address fields for submission
            const addressParts = [submitData.house_number, submitData.street, submitData.barangay, submitData.location];
            if (submitData.landmark) {
                addressParts.push(`(Near: ${submitData.landmark})`);
            }
            submitData.address = addressParts.join(', ');
            // Remove individual fields after combining
            delete submitData.location;
            delete submitData.barangay;
            delete submitData.street;
            delete submitData.house_number;
            delete submitData.landmark;
            // Calculate delivery fee (10% of total)
            const calculatedDeliveryFee = totalPrice * 0.10;
            submitData.delivery_fee = calculatedDeliveryFee;
        }

        // Combine purpose and purpose_other if "Others" is selected
        submitData.purpose = submitData.purpose === 'Others' ? submitData.purpose_other : submitData.purpose;

        // Convert tank_types array to comma-separated string for submission
        submitData.tank_type = submitData.tank_types.filter((t: string) => t !== '').join(', ');
        delete submitData.tank_types;

        router.post('/user/rentals', submitData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
            },
            onSuccess: () => {
                setShowSuccessModal(true);
                // Reset form after successful submission
                setFormData({
                    request_type: 'rental',
                    tank_types: [''],
                    purpose: '',
                    purpose_other: '',
                    contact_number: '',
                    location: 'General Tinio, Nueva Ecija',
                    barangay: '',
                    street: '',
                    house_number: '',
                    landmark: '',
                    pickup_type: 'delivery',
                    priority: 'normal'
                });
            }
        });
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Clear tank types when switching request type
        if (field === 'request_type') {
            setFormData(prev => ({ ...prev, tank_types: [''] }));
        }
    };

    const handleTankTypeChange = (index: number, value: string) => {
        const newTankTypes = [...formData.tank_types];
        newTankTypes[index] = value;
        setFormData(prev => ({ ...prev, tank_types: newTankTypes }));

        // Auto-fill purpose when tank type changes (only for the first tank)
        if (index === 0) {
            setFormData(prev => ({
                ...prev,
                purpose: getAutoPurpose(value),
                purpose_other: ''
            }));
        }
    };

    const addTank = () => {
        setFormData(prev => ({ ...prev, tank_types: [...prev.tank_types, ''] }));
    };

    const removeTank = (index: number) => {
        if (formData.tank_types.length > 1) {
            const newTankTypes = formData.tank_types.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, tank_types: newTankTypes }));
        }
    };

    const handleTextAreaChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const breadcrumbsWithCreate: BreadcrumbItem[] = [
        ...breadcrumbs,
        { title: 'New Rental Request', href: '/user/rentals/create' }
    ];

    // Filter tank types based on request type
    const availableTankTypes = formData.request_type === 'refill'
        ? tankTypes.filter(tank => approved_rental_requests.includes(tank.type))
        : tankTypes;

    // Calculate total price
    const totalPrice = formData.tank_types.reduce((sum, tankType) => {
        if (!tankType) return sum;
        const tank = availableTankTypes.find(t => t.type === tankType);
        return sum + (tank ? tank.price : 0);
    }, 0);

    // Calculate delivery fee (10% of total price for delivery)
    const deliveryFee = formData.pickup_type === 'delivery' ? totalPrice * 0.10 : 0;

    // Calculate total with delivery fee
    const totalWithDelivery = totalPrice + deliveryFee;

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

    return (
        <AppLayout>
            <Head title="New Rental Request" />
            <div className="min-h-screen bg-gray-50 p-6 w-full">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbsWithCreate} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">New Rental Request</h1>
                            <p className="text-gray-600">Submit a request for oxygen tank rental</p>
                        </div>
                        <a
                            href="/user/dashboard"
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Request Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Request Type *
                            </label>
                            <select
                                value={formData.request_type}
                                onChange={(e) => handleChange('request_type', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.request_type ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="rental">Rent</option>
                                <option value="refill">Refill</option>
                            </select>
                            {errors.request_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.request_type}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority Level *
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.priority ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            {errors.priority && (
                                <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                            )}
                        </div>

                        {/* Tank Type */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tank Type *
                                </label>
                                <button
                                    type="button"
                                    onClick={addTank}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Another Tank
                                </button>
                            </div>

                            {/* Multiple Tank Selections */}
                            <div className="space-y-6">
                                {formData.tank_types.map((selectedTank, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-700">Tank #{index + 1}</span>
                                            {formData.tank_types.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTank(index)}
                                                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {availableTankTypes.map(tank => (
                                                <div
                                                    key={tank.type}
                                                    onClick={() => handleTankTypeChange(index, tank.type)}
                                                    className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                                                        selectedTank === tank.type
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                                                    }`}
                                                >
                                                    <div className="p-4">
                                                        {tank.image ? (
                                                            <div className="w-full h-32 bg-gray-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                                                                <img
                                                                    src={tank.image}
                                                                    alt={tank.type}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.parentElement?.classList.add('hidden');
                                                                        e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : null}
                                                        <div className={`w-full h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center ${tank.image ? 'hidden' : ''}`}>
                                                            <Package className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                        <h3 className="font-semibold text-gray-800 mb-1 text-sm">{tank.type}</h3>
                                                        <p className="text-sm text-gray-600 mb-1">₱{tank.price.toFixed(2)}</p>
                                                        <p className="text-xs text-gray-500">Stock: {tank.quantity}</p>
                                                    </div>
                                                    {selectedTank === tank.type && (
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {selectedTank === '' && (
                                            <p className="text-sm text-gray-500 mt-2">Please select a tank type</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.tank_type && (
                                <p className="mt-2 text-sm text-red-600">{errors.tank_type}</p>
                            )}
                        </div>

                        {/* Total Price */}
                        {totalPrice > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-medium text-gray-700">Subtotal:</span>
                                        <span className="text-xl font-semibold text-gray-800">₱{totalPrice.toFixed(2)}</span>
                                    </div>
                                    {formData.pickup_type === 'delivery' && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium text-gray-700">Delivery Fee (10%):</span>
                                            <span className="text-xl font-semibold text-gray-800">₱{deliveryFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-blue-300">
                                        <span className="text-xl font-bold text-gray-800">Total:</span>
                                        <span className="text-2xl font-bold text-blue-600">₱{totalWithDelivery.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pickup Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pickup Type *
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="pickup_type"
                                        value="delivery"
                                        checked={formData.pickup_type === 'delivery'}
                                        onChange={(e) => handleChange('pickup_type', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span>Delivery</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="pickup_type"
                                        value="pickup"
                                        checked={formData.pickup_type === 'pickup'}
                                        onChange={(e) => handleChange('pickup_type', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span>Pickup</span>
                                </label>
                            </div>
                            {errors.pickup_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.pickup_type}</p>
                            )}
                        </div>

                        {/* Purpose */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purpose *
                            </label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => handleChange('purpose', e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.purpose ? 'border-red-500' : 'border-gray-300'
                                }`}
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
                            {errors.purpose && (
                                <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                            )}
                        </div>

                        {/* Purpose Other - Only show when Others is selected */}
                        {formData.purpose === 'Others' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please Specify *
                                </label>
                                <textarea
                                    value={formData.purpose_other}
                                    onChange={(e) => handleTextAreaChange('purpose_other', e.target.value)}
                                    rows={3}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.purpose_other ? 'border-red-500' : 'border-gray-300'
                                }`}
                                    placeholder="Please describe the purpose of your rental request..."
                                    required
                                />
                                {errors.purpose_other && (
                                    <p className="mt-1 text-sm text-red-600">{errors.purpose_other}</p>
                                )}
                            </div>
                        )}

                        {/* Contact Information */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.contact_number}
                                    onChange={(e) => handleChange('contact_number', e.target.value)}
                                    className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.contact_number ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="09XX-XXX-XXXX"
                                    required
                                />
                            </div>
                            {errors.contact_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                            )}
                        </div>

                        {/* Delivery Address - Only show when delivery is selected */}
                        {formData.pickup_type === 'delivery' && (
                            <div>
                                <div className="flex items-center mb-3">
                                    <MapPin className="w-4 h-4 text-gray-600 mr-2" />
                                    <label className="text-sm font-medium text-gray-700">
                                        Delivery Address *
                                    </label>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Location/Municipality *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            readOnly
                                            className={`w-full p-3 border rounded-lg bg-gray-100 text-gray-700 ${
                                                errors.location ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="General Tinio, Nueva Ecija"
                                            required={formData.pickup_type === 'delivery'}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Fixed to General Tinio, Nueva Ecija</p>
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                        )}
                                    </div>

                                    {/* Barangay */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Barangay *
                                        </label>
                                        <select
                                            value={formData.barangay}
                                            onChange={(e) => handleChange('barangay', e.target.value)}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.barangay ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required={formData.pickup_type === 'delivery'}
                                        >
                                            <option value="">Select Barangay</option>
                                            <option value="Padolina">Padolina</option>
                                            <option value="Concepcion">Concepcion</option>
                                            <option value="Rio Chico">Rio Chico</option>
                                            <option value="Pias">Pias</option>
                                            <option value="Nazareth">Nazareth</option>
                                            <option value="San Pedro">San Pedro</option>
                                            <option value="Poblacion West">Poblacion West</option>
                                            <option value="Poblacion Central">Poblacion Central</option>
                                            <option value="Sampaguita">Sampaguita</option>
                                            <option value="Bago">Bago</option>
                                            <option value="Poblacion East">Poblacion East</option>
                                            <option value="Pulong Matong">Pulong Matong</option>
                                            <option value="Palale">Palale</option>
                                        </select>
                                        {errors.barangay && (
                                            <p className="mt-1 text-sm text-red-600">{errors.barangay}</p>
                                        )}
                                    </div>


                                    {/* Street */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Street *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) => handleChange('street', e.target.value)}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.street ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="e.g., Rizal Street"
                                            required={formData.pickup_type === 'delivery'}
                                        />
                                        {errors.street && (
                                            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                                        )}
                                    </div>

                                    {/* House Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            House Number/Block/Lot *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.house_number}
                                            onChange={(e) => handleChange('house_number', e.target.value)}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.house_number ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="e.g., Block 1 Lot 23, House No. 45"
                                            required={formData.pickup_type === 'delivery'}
                                        />
                                        {errors.house_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.house_number}</p>
                                        )}
                                    </div>

                                    {/* Landmark */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={(e) => handleChange('landmark', e.target.value)}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.landmark ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="e.g., Near school, beside church, in front of market"
                                        />
                                        {errors.landmark && (
                                            <p className="mt-1 text-sm text-red-600">{errors.landmark}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Helps our delivery team find your location easily</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <a
                                href="/user/dashboard"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </a>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent>
                        <DialogHeader>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <DialogTitle className="text-2xl">Request Submitted!</DialogTitle>
                                <DialogDescription className="text-base mt-2">
                                    Your rental request has been submitted successfully. We will review your request and get back to you soon.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
