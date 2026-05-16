import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, MapPin, Phone, Mail, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useState, useEffect } from 'react';

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
        password: '',
        password_confirmation: '',
        notes: '',
        is_active: true,
    });

    // Password requirements state
    const [requirements, setRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordStrengthText, setPasswordStrengthText] = useState('Enter a password');
    const [passwordStrengthColor, setPasswordStrengthColor] = useState('text-muted');
    const [passwordMatch, setPasswordMatch] = useState<'empty' | 'match' | 'nomatch'>('empty');

    const checkPasswordStrength = (password: string) => {
        let strength = 0;
        const reqs = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };

        setRequirements(reqs);

        // Calculate strength
        Object.values(reqs).forEach(met => {
            if (met) strength += 20;
        });

        setPasswordStrength(strength);

        if (password.length === 0) {
            setPasswordStrengthText('Enter a password');
            setPasswordStrengthColor('text-muted');
        } else if (strength <= 40) {
            setPasswordStrengthText('🔴 Weak password');
            setPasswordStrengthColor('text-danger');
        } else if (strength <= 60) {
            setPasswordStrengthText('🟠 Fair strength');
            setPasswordStrengthColor('text-warning');
        } else if (strength <= 80) {
            setPasswordStrengthText('🔵 Good strength');
            setPasswordStrengthColor('text-info');
        } else {
            setPasswordStrengthText('🟢 Strong password');
            setPasswordStrengthColor('text-success');
        }
    };

    const checkPasswordMatch = () => {
        if (data.password_confirmation.length === 0) {
            setPasswordMatch('empty');
        } else if (data.password === data.password_confirmation) {
            setPasswordMatch('match');
        } else {
            setPasswordMatch('nomatch');
        }
    };

    // Effects for password validation
    useEffect(() => {
        checkPasswordMatch();
    }, [data.password, data.password_confirmation]);

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
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g., supplier@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-900">Account Login Information</h3>
                            
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="pr-12"
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}
                                        value={data.password}
                                        onChange={(e) => {
                                            setData('password', e.target.value);
                                            checkPasswordStrength(e.target.value);
                                        }}
                                        required
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-700"
                                        style={{
                                            borderRadius: '0 8px 8px 0',
                                            border: 'none',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                                
                                {/* Password Strength Meter */}
                                <div className="mt-2">
                                    <div className="progress mt-2" style={{ height: '12px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar" 
                                            style={{ 
                                                width: `${passwordStrength}%`, 
                                                transition: 'width 0.4s ease, background-color 0.4s ease',
                                                borderRadius: '6px',
                                                backgroundColor: passwordStrength <= 40 ? '#dc3545' : passwordStrength <= 60 ? '#ffc107' : passwordStrength <= 80 ? '#17a2b8' : '#28a745',
                                                border: 'none',
                                                minHeight: '12px'
                                            }}
                                        />
                                    </div>
                                    <small className={`mt-1 d-block ${passwordStrengthColor}`}>
                                        {passwordStrengthText}
                                    </small>
                                    
                                    {/* Password Requirements */}
                                    {data.password && (
                                        <div className="mt-2 p-3 bg-light rounded">
                                            <h6 className="fw-semibold mb-2 text-black">Password Requirements:</h6>
                                            <ul className="mb-0 ps-3 small">
                                                <li className={requirements.length ? 'text-success' : 'text-black'}>
                                                    {requirements.length && '✓ '}At least 8 characters
                                                </li>
                                                <li className={requirements.lowercase ? 'text-success' : 'text-black'}>
                                                    {requirements.lowercase && '✓ '}One lowercase letter (a-z)
                                                </li>
                                                <li className={requirements.uppercase ? 'text-success' : 'text-black'}>
                                                    {requirements.uppercase && '✓ '}One uppercase letter (A-Z)
                                                </li>
                                                <li className={requirements.number ? 'text-success' : 'text-black'}>
                                                    {requirements.number && '✓ '}One number (0-9)
                                                </li>
                                                <li className={requirements.special ? 'text-success' : 'text-black'}>
                                                    {requirements.special && '✓ '}One special character (!@#$%^&*)
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="pr-12"
                                        style={{
                                            borderRadius: '8px',
                                            border: passwordMatch === 'match' ? '1px solid #198754' : passwordMatch === 'nomatch' ? '1px solid #dc3545' : '1px solid #ddd'
                                        }}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-700"
                                        style={{
                                            borderRadius: '0 8px 8px 0',
                                            border: 'none',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {passwordMatch === 'match' && (
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Passwords match
                                    </p>
                                )}
                                {passwordMatch === 'nomatch' && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangleIcon className="w-4 h-4" />
                                        Passwords do not match
                                    </p>
                                )}
                                <InputError message={errors.password_confirmation} />
                            </div>
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
