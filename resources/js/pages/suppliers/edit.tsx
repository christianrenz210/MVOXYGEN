import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, MapPin, Phone, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Supplier {
    id: number;
    name: string;
    plant_name?: string;
    address: string;
    contact_person: string;
    contact_number: string;
    email?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    supplier: Supplier;
}

export default function SupplierEdit({ supplier }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name,
        plant_name: supplier.plant_name || '',
        address: supplier.address,
        contact_person: supplier.contact_person,
        contact_number: supplier.contact_number,
        email: supplier.email || '',
        notes: supplier.notes || '',
        is_active: supplier.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Suppliers', href: '/suppliers' },
        { title: 'Edit Supplier', href: `/suppliers/${supplier.id}/edit` },
    ];

    return (
        <AppLayout>
            <Head title="Edit Supplier - MV Oxygen Trading" />
            
            <div className="p-6 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                
                <div className="flex items-center gap-4">
                    <Link href={route('suppliers.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
                        <p className="text-gray-600">Update supplier information</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Basic Information
                                </h2>
                                
                                <div>
                                    <Label htmlFor="name">Supplier Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter supplier name"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="plant_name">Plant Name</Label>
                                    <Input
                                        id="plant_name"
                                        type="text"
                                        value={data.plant_name}
                                        onChange={(e) => setData('plant_name', e.target.value)}
                                        placeholder="Enter plant name (optional)"
                                    />
                                    <InputError message={errors.plant_name} />
                                </div>

                                <div>
                                    <Label htmlFor="address">Address *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="address"
                                            type="text"
                                            className="pl-10"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Enter complete address"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.address} />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Contact Information
                                </h2>

                                <div>
                                    <Label htmlFor="contact_person">Contact Person *</Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="Enter contact person name"
                                        required
                                    />
                                    <InputError message={errors.contact_person} />
                                </div>

                                <div>
                                    <Label htmlFor="contact_number">Contact Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="contact_number"
                                            type="tel"
                                            className="pl-10"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="Enter contact number"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.contact_number} />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-10"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address (optional)"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                            
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any additional notes (optional)"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Active Supplier
                                </Label>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <Link href={route('suppliers.index')}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Supplier'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
