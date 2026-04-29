import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, MapPin, Phone, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Breadcrumbs } from '@/components/breadcrumbs';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Suppliers', href: '/suppliers' },
    { title: 'Add Supplier', href: '/suppliers/create' },
];

export default function SupplierCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        plant_name: '',
        address: '',
        contact_person: '',
        contact_number: '',
        email: '',
        notes: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('suppliers.store'));
    };

    return (
        <AppLayout>
            <Head title="Add Supplier - MV Oxygen Trading" />
            
            <div className="p-6 space-y-6">
                {/* Breadcrumbs at the bottom */}
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
                        <h1 className="text-3xl font-bold text-gray-900">Add Supplier</h1>
                        <p className="mt-2 text-gray-600">Add a new oxygen tank supplier or plant</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Supplier Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Oxygen Supply Co."
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="plant_name">Plant Name (Optional)</Label>
                                <Input
                                    id="plant_name"
                                    type="text"
                                    value={data.plant_name}
                                    onChange={(e) => setData('plant_name', e.target.value)}
                                    placeholder="e.g., Main Plant"
                                />
                                <InputError message={errors.plant_name} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address">Address *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="address"
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g., 123 Main St, City"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="contact_person">Contact Person *</Label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="e.g., John Doe"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.contact_person} />
                            </div>

                            <div>
                                <Label htmlFor="contact_number">Contact Number *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="contact_number"
                                        type="text"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="e.g., +63 912 345 6789"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.contact_number} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email (Optional)</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g., supplier@example.com"
                                    className="pl-10"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                placeholder="Additional notes about this supplier..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <InputError message={errors.notes} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_active', e.target.checked as any)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="is_active" className="text-sm font-normal">
                                Active supplier
                            </Label>
                        </div>

                        <div className="flex gap-3">
                            <Link href={route('suppliers.index')}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Supplier'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
