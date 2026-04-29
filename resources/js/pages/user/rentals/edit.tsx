import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Package, Calendar, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState, useEffect } from 'react';

interface RentalRequest {
    id: number;
    tank_type: string;
    quantity: number;
    start_date: string;
    end_date: string;
    purpose: string;
    contact_number: string;
    address: string;
    status: string;
    request_type?: string;
    assigned_tank?: {
        tank_id: string;
        tank_type: string;
        quantity: number;
        status: string;
        last_refilled?: string;
        image?: string;
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
    [key: string]: any;
}

export default function RentalRequestEdit() {
    const { props } = usePage<PageProps>();
    const { rentalRequest, breadcrumbs } = props;

    // Debug: Check if assigned_tank and image are received
    console.log('Edit page rentalRequest:', rentalRequest);
    console.log('Assigned tank:', rentalRequest.assigned_tank);
    console.log('Assigned tank image:', rentalRequest.assigned_tank?.image);
    
    const [formData, setFormData] = useState({
        request_type: rentalRequest.request_type || 'rental',
        tank_type: rentalRequest.tank_type || '',
        purpose: rentalRequest.purpose || '',
        contact_number: rentalRequest.contact_number || '',
        address: rentalRequest.address || '',
        pickup_type: rentalRequest.address && rentalRequest.address !== 'Pickup at Store' ? 'delivery' : 'pickup'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(`/user/rentals/${rentalRequest.id}`, formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
            },
            onSuccess: () => {
                router.visit(`/user/rentals/${rentalRequest.id}`);
            }
        });
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const tankTypes = [
        'Medical Oxygen',
        'Industrial Oxygen', 
        'Argon Tank',
        'NitroGen',
        'Flask Type Tank',
        'Acetylene'
    ];

    return (
        <AppLayout>
            <Head title={`Edit Rental Request #${rentalRequest.id}`} />
            <div className="min-h-screen bg-gray-50 p-6 w-full">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Rental Request</h1>
                            <p className="text-gray-600">Update your rental request details</p>
                        </div>
                        <a
                            href={`/user/rentals/${rentalRequest.id}`}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Request
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
                                <option value="rental">New Rental</option>
                                <option value="refill">Refill</option>
                            </select>
                            {errors.request_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.request_type}</p>
                            )}
                        </div>

                        {/* Tank Type with Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tank Type *
                            </label>
                            <div className="space-y-3">
                                <select
                                    value={formData.tank_type}
                                    onChange={(e) => handleChange('tank_type', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.tank_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">Select tank type</option>
                                    {tankTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {errors.tank_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tank_type}</p>
                                )}

                                {/* Display tank image (read-only) */}
                                {rentalRequest.assigned_tank?.image && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Tank Image</p>
                                        <img
                                            src={rentalRequest.assigned_tank.image}
                                            alt={rentalRequest.assigned_tank.tank_type}
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

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
                            <textarea
                                value={formData.purpose}
                                onChange={(e) => handleChange('purpose', e.target.value)}
                                rows={3}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.purpose ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Please describe the purpose of your rental request..."
                                required
                            />
                            {errors.purpose && (
                                <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                            )}
                        </div>

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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter your complete delivery address"
                                        required
                                    />
                                </div>
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <a
                                href={`/user/rentals/${rentalRequest.id}`}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </a>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Update Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
