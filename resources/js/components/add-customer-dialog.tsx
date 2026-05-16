import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Plus, Eye, EyeOff, Mail, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { formatPhoneNumber, stripCountryCode, sanitizePhoneDigits } from '@/utils/phone';
import OtpVerificationModal from './otp-verification-modal';

interface AddCustomerDialogProps {
    onSuccess?: () => void;
}

export default function AddCustomerDialog({ onSuccess }: AddCustomerDialogProps) {
    const [open, setOpen] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        status: 'active' as const,
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

    const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = sanitizePhoneDigits(e.target.value);
        setData('contact_number', formatPhoneNumber(digits));
    };

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
        
        // Validate form first
        if (!data.name || !data.email || !data.password || !data.password_confirmation) {
            return;
        }
        
        // Check password requirements
        if (!requirements.length || !requirements.lowercase || !requirements.uppercase || !requirements.number || !requirements.special) {
            return;
        }
        
        // Check password match
        if (passwordMatch !== 'match') {
            return;
        }
        
        // Send OTP first
        sendOtpAndShowModal();
    };

    const sendOtpAndShowModal = async () => {
        setIsSendingOtp(true);
        
        try {
            const response = await fetch('/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email: data.email,
                    type: 'customer_creation'
                })
            });

            const result = await response.json();

            if (result.success) {
                setShowOtpModal(true);
            } else {
                console.error('=== OTP EMAIL SENDING ERROR ===');
                console.error('Error Message:', result.message);
                console.error('Error Details:', result.error);
                console.error('Error Type:', result.error_type);
                console.error('Debug Info:', result.debug_info);
                console.error('Test OTP:', result.test_otp);
                console.error('================================');
                
                // Show alert to user
                alert(`Error sending OTP email: ${result.message}\n\nError: ${result.error}\n\nTest OTP: ${result.test_otp}`);
            }
        } catch (error) {
            console.error('=== OTP EMAIL SENDING ERROR ===');
            console.error('Network Error:', error);
            console.error('================================');
            
            // Show alert to user
            alert(`Network error sending OTP email: ${error}`);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpVerified = () => {
        setOtpVerified(true);
        setShowOtpModal(false);

        // Now create the customer
        post('/customer', {
            onSuccess: (page) => {
                setOpen(false);
                reset();
                setOtpVerified(false);
                onSuccess?.();
                // Show success modal
                setShowSuccessModal(true);
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
                alert('Form errors: ' + JSON.stringify(errors));
                setOtpVerified(false);
            },
        });
    };

    const handleOtpCancel = () => {
        setShowOtpModal(false);
        setOtpVerified(false);
    };

    const handleOtpBack = () => {
        setShowOtpModal(false);
        setOtpVerified(false);
    };

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                            Create a new customer record. Fill in the required information below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter customer name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contact_number">Contact Number (Optional)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 text-sm font-medium">+63</span>
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={11}
                                        className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #ddd'
                                        }}
                                        value={stripCountryCode(data.contact_number || '')}
                                        onChange={handleContactNumberChange}
                                        placeholder="9XXXXXXXXX"
                                    />
                                </div>
                                {errors.contact_number && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {errors.contact_number}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
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
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
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
                                        <AlertTriangle className="w-4 h-4" />
                                        Passwords do not match
                                    </p>
                                )}
                                <InputError message={errors.password_confirmation} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as typeof data.status)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <p className="text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || isSendingOtp}>
                                {isSendingOtp ? 'Sending OTP...' : processing ? 'Adding...' : 'Add Customer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* OTP Verification Modal */}
            <OtpVerificationModal
                open={showOtpModal}
                onOpenChange={setShowOtpModal}
                email={data.email}
                onVerified={handleOtpVerified}
                onCancel={handleOtpCancel}
                onBack={handleOtpBack}
            />
        </>
    );
}
