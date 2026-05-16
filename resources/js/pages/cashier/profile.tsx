import { Head } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    User, 
    Mail, 
    Phone, 
    Calendar,
    ArrowLeft,
    Save
} from 'lucide-react';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

interface ProfileProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            phone?: string;
            role: string;
            profile_image?: string;
            created_at: string;
        };
    };
}

export default function CashierProfile({ auth }: ProfileProps) {
    const [formData, setFormData] = useState({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const page = usePage();
    const flashSuccess = (page.props as any).flash?.success as string | undefined;
    const flashError = (page.props as any).flash?.error as string | undefined;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/cashier/profile', formData, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Profile update errors:', errors);
            }
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            admin: 'destructive',
            vendor: 'secondary',
            cashier: 'default',
            user: 'outline'
        };
        
        return (
            <Badge variant={variants[role] || 'outline'} className="capitalize">
                {role}
            </Badge>
        );
    };

    return (
        <CashierLayout>
            <Head title="Profile Settings" />
            
            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/cashier/dashboard'}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
                        <p className="text-muted-foreground">
                            Manage your personal information and account settings
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Overview */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                        {auth.user.profile_image ? (
                                            <img
                                                src={`/storage/${auth.user.profile_image}`}
                                                alt={auth.user.name}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : null}
                                        {!auth.user.profile_image && <User className="w-10 h-10 text-gray-400" />}
                                    </div>
                                    <h3 className="font-semibold text-lg">{auth.user.name}</h3>
                                    {getRoleBadge(auth.user.role)}
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{auth.user.email}</span>
                                    </div>
                                    {auth.user.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-medium">{auth.user.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Member since:</span>
                                        <span className="font-medium">{formatDate(auth.user.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Edit Profile Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Flash Messages */}
                                {flashSuccess && (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-sm">{flashSuccess}</p>
                                    </div>
                                )}
                                
                                {flashError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-800 text-sm">{flashError}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={() => setFormData({
                                                name: auth.user.name,
                                                email: auth.user.email,
                                                phone: auth.user.phone || ''
                                            })}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                                        <p className="font-mono text-sm">#{auth.user.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getRoleBadge(auth.user.role)}
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="text-sm text-muted-foreground">
                                    <p className="mb-2">
                                        <strong>Account Permissions:</strong>
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Process sales transactions</li>
                                        <li>View sales history and reports</li>
                                        <li>Manage customer information</li>
                                        <li>Update personal profile</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}
