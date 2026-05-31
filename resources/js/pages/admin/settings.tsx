import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database, Download, Upload, AlertCircle, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { sanitizePhoneDigits, formatPhoneNumber, stripCountryCode } from '@/utils/phone';

interface PageProps {
    breadcrumbs: BreadcrumbItem[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            phone?: string;
            address?: string;
            profile_image?: string;
        };
    };
    [key: string]: any;
}

export default function AdminSettings() {
    const { props } = usePage<PageProps>();
    const { breadcrumbs, auth } = props;
    
    // Log for debugging
    console.log('Page props:', props);
    console.log('Flash:', (props as any).flash);
    
    const [isBackingUp, setIsBackingUp] = React.useState(false);
    const [isRestoring, setIsRestoring] = React.useState(false);
    const [showBackupModal, setShowBackupModal] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [downloadFile, setDownloadFile] = React.useState('');
    const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
    const [profileImage, setProfileImage] = React.useState<File | null>(null);
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: formatPhoneNumber(auth.user.phone || ''),
        address: auth.user.address || '',
    });

    const handleBackup = () => {
        setIsBackingUp(true);
        router.post('/admin/backup', {}, {
            onSuccess: (page) => {
                console.log('Backup successful');
                // Try to get the filename from the URL or page props
                const filename = (page as any).props?.download_file || `backup_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '-')}.sql`;
                setDownloadFile(filename);
                setShowBackupModal(true);
            },
            onError: (errors) => {
                console.error('Backup failed:', errors);
            },
            onFinish: () => setIsBackingUp(false),
        });
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            phone: formatPhoneNumber(formData.phone),
        };

        router.post('/admin/settings/profile', submissionData, {
            onSuccess: () => {
                console.log('Profile updated successfully');
            },
        });
    };

    const handleProfileImageUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileImage) {
            return;
        }

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('profile_image', profileImage);

        router.post('/admin/settings/profile-image', formData, {
            onSuccess: () => {
                setSuccessMessage('Profile image updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setProfileImage(null);
                router.reload();
            },
            onError: (errors) => {
                console.error('Profile image upload failed:', errors);
            },
            onFinish: () => setIsUploadingImage(false),
        });
    };

    const handleRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!restoreFile) {
            return;
        }

        setIsRestoring(true);
        const formData = new FormData();
        formData.append('backup_file', restoreFile);

        router.post('/admin/restore', formData, {
            onSuccess: () => {
                setSuccessMessage('Database restored successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setRestoreFile(null);
            },
            onError: (errors) => {
                console.error('Restore errors:', errors);
            },
            onFinish: () => setIsRestoring(false),
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digits = sanitizePhoneDigits(value);
            setFormData(prev => ({
                ...prev,
                phone: formatPhoneNumber(digits),
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings" />

            <div className="w-full p-6 space-y-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Header */}
                <div className="animate-fadeInUp">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
                    <p className="text-gray-600">Manage system settings and data</p>
                </div>

                {/* Profile Information */}
                <Card className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {auth.user.profile_image ? (
                                        <img
                                            src={`/storage/${auth.user.profile_image}`}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 ${auth.user.profile_image ? 'hidden' : ''}`}>
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Admin Profile</p>
                                    <p className="text-xs text-gray-500 mt-1">Manage your admin account information</p>
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            type="file"
                                            id="profile_image"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setProfileImage(file);
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
                                        {profileImage && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleProfileImageUpload}
                                                disabled={isUploadingImage}
                                                className="text-xs"
                                            >
                                                {isUploadingImage ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        )}
                                    </div>
                                    {profileImage && (
                                        <p className="text-xs text-gray-500 mt-1">Selected: {profileImage.name}</p>
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
                                    <Label htmlFor="phone">Contact Number</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">+63</span>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={11}
                                            value={stripCountryCode(formData.phone)}
                                            onChange={handleInputChange}
                                            placeholder="9XXXXXXXXX"
                                        />
                                    </div>
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

                {/* Backup Section */}
                <Card className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Database Backup
                        </CardTitle>
                        <CardDescription>
                            Create and download database backups
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold">Backup Information</p>
                                <p className="mt-1">Regular backups are recommended to prevent data loss. Backups include all customers, rentals, inventory, and user data.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleBackup}
                                disabled={isBackingUp}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Admin Settings */}
                <Card className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Restore Backup
                        </CardTitle>
                        <CardDescription>
                            Restore database from a backup file
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-semibold">Warning</p>
                                <p className="mt-1">Restoring from a backup will replace all current data. This action cannot be undone.</p>
                            </div>
                        </div>

                        <form onSubmit={handleRestore} className="space-y-4">
                            <div>
                                <Label htmlFor="backup_file">Upload Backup File (.sql)</Label>
                                <Input
                                    id="backup_file"
                                    type="file"
                                    accept=".sql"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setRestoreFile(file);
                                        }
                                    }}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Select a .sql backup file to restore the database.</p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isRestoring || !restoreFile}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isRestoring ? 'Restoring...' : 'Restore Backup'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Backup Success Modal */}
                <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Backup Created Successfully
                            </DialogTitle>
                            <DialogDescription>
                                Your database backup has been created successfully. You can download it now.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowBackupModal(false)}
                            >
                                Close
                            </Button>
                            {downloadFile && (
                                <Button
                                    asChild
                                    className="flex items-center gap-2"
                                >
                                    <a href={`/admin/backups/${downloadFile}/download`}>
                                        <Download className="w-4 h-4" />
                                        Download Backup
                                    </a>
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
