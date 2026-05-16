import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import SupplierLayout from '@/layouts/supplier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Supplier {
    id: number;
    name: string;
    plant_name: string | null;
    address: string;
    contact_person: string;
    contact_number: string;
    email: string | null;
}

interface PageProps {
    supplier: Supplier;
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supplier Dashboard', href: '/supplier/dashboard' },
    { title: 'Settings', href: '/supplier/settings' },
];

export default function SupplierSettings() {
    const { props } = usePage<PageProps>();
    const { supplier, auth } = props;

    // Get flash messages from Inertia
    const flash = usePage().props.flash as any;
    const [successMessage, setSuccessMessage] = React.useState(flash?.success || '');
    
    // Clear success message after 3 seconds
    React.useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const [formData, setFormData] = React.useState({
        name: supplier?.name || '',
        plant_name: supplier?.plant_name || '',
        contact_person: supplier?.contact_person || '',
        contact_number: supplier?.contact_number || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/supplier/settings/profile', formData, {
            onSuccess: () => {
                console.log('Profile updated successfully');
                router.reload();
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <SupplierLayout>
            <Head title="Supplier Settings" />

            <div className="w-full space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Supplier Settings</h1>
                    <p className="text-gray-600">Manage your supplier account settings and profile</p>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Supplier Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* Supplier Icon */}
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                                    <Building2 className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{supplier?.name || 'Supplier'}</p>
                                    <p className="text-xs text-gray-500 mt-1">{supplier?.plant_name || 'No plant name set'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Company / Supplier Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="plant_name">Plant Name</Label>
                                    <Input
                                        id="plant_name"
                                        name="plant_name"
                                        type="text"
                                        value={formData.plant_name}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        name="contact_person"
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        name="contact_number"
                                        type="tel"
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Update Profile</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SupplierLayout>
    );
}
