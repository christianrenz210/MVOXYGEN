import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    contact_number?: string;
    address?: string;
    profile_image?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    user: UserProfile;
    breadcrumbs: BreadcrumbItem[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    [key: string]: any; // Add index signature for Inertia
}

export default function UserSettings() {
    const { props } = usePage<PageProps>();
    const { user, breadcrumbs, auth } = props;
    const { appearance, updateAppearance } = useAppearance();

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
        name: user.name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        address: user.address || '',
        profile_image: null as File | null,
    });
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('contact_number', formData.contact_number);
        data.append('address', formData.address);
        if (formData.profile_image) {
            data.append('profile_image', formData.profile_image);
        }

        router.post('/user/settings/profile', data, {
            onSuccess: () => {
                // Show success message (handled by flash session)
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            <div className="w-full p-6 space-y-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* Profile Image Upload */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {user.profile_image ? (
                                        <img
                                            src={`/storage/${user.profile_image}`}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 ${user.profile_image ? 'hidden' : ''}`}>
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">User Profile</p>
                                    <p className="text-xs text-gray-500 mt-1">Manage your profile information</p>
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            type="file"
                                            id="profile_image"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setFormData({ ...formData, profile_image: file });
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="profile_image"
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                                        >
                                            Choose Image
                                        </label>
                                        {formData.profile_image && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleProfileUpdate(e);
                                                }}
                                                disabled={isUploadingImage}
                                                className="text-xs"
                                            >
                                                {isUploadingImage ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        )}
                                    </div>
                                    {formData.profile_image && (
                                        <p className="text-xs text-gray-500 mt-1">Selected: {formData.profile_image.name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
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
        </AppLayout>
    );
}
