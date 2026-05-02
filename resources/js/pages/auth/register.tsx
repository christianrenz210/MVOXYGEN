import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, ArrowLeft, UserPlus, Shield, CheckCircle, Info, AlertTriangle, Mail, Hourglass, RotateCcw, X } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
    interface Window {
        grecaptcha: any;
    }
}

interface RegisterForm {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    [key: string]: string | number | boolean | Blob | File | null | undefined;
}

interface RegisterProps {
    status?: string;
    otp_sent?: string;
    otp_error?: string;
    user_id?: string;
    otp_code?: string;
}

export default function Register({ status, otp_sent, otp_error, user_id, otp_code }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordStrengthText, setPasswordStrengthText] = useState('Enter a password');
    const [passwordStrengthColor, setPasswordStrengthColor] = useState('text-muted');
    const [passwordMatch, setPasswordMatch] = useState<'empty' | 'match' | 'nomatch'>('empty');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [userId, setUserId] = useState('');
    const [testOtpCode, setTestOtpCode] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [recaptchaError, setRecaptchaError] = useState('');
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

    // Register form data
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        recaptcha_token: '',
    });

    // Password requirements state
    const [requirements, setRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // If no reCAPTCHA token, don't submit
        if (!recaptchaToken) {
            return;
        }
        
        // Submit form
        post(route('register'), {
            onSuccess: (page) => {
                // Handle successful registration
                if (page.props.otp_code) {
                    setTestOtpCode(String(page.props.otp_code));
                }
                if (page.props.user_id) {
                    setUserId(String(page.props.user_id));
                    setShowOtpModal(true);
                }
                // Reset password fields after successful registration
                reset('password', 'password_confirmation');
            },
        });
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

        // Calculate strength based on requirements met (20% per requirement)
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

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle OTP verification
        router.post(route('otp.verify.post'), { otp: otpCode, user_id: userId });
    };

    const handleResendOtp = () => {
        router.post(route('otp.resend'), { user_id: userId }, {
            onSuccess: (page) => {
                if (page.props.otp_code) {
                    setTestOtpCode(typeof page.props.otp_code === 'string' ? page.props.otp_code : '');
                }
            },
        });
    };

    const capitalizeName = (name: string) => {
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Simple reCAPTCHA callback setup
    useEffect(() => {
        // Set up global callbacks
        (window as any).onRecaptchaSuccess = (token: string) => {
            console.log('reCAPTCHA verified:', token);
            setRecaptchaToken(token);
            setData('recaptcha_token', token);
        };

        (window as any).onRecaptchaExpired = () => {
            console.log('reCAPTCHA expired');
            setRecaptchaToken('');
            setData('recaptcha_token', '');
        };

        // Mark as loaded when page mounts (reCAPTCHA will render naturally)
        setRecaptchaLoaded(true);

        return () => {
            delete (window as any).onRecaptchaSuccess;
            delete (window as any).onRecaptchaExpired;
        };
    }, [setData]);

    useEffect(() => {
        checkPasswordMatch();
    }, [data.password, data.password_confirmation]);

    useEffect(() => {
        if (status || otp_sent) {
            setShowSuccessModal(true);
        }
    }, [status, otp_sent]);

    useEffect(() => {
        if (user_id) {
            setUserId(user_id);
            setShowOtpModal(true);
        }
        if (otp_code) {
            setTestOtpCode(otp_code);
        }
    }, [user_id, otp_code]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4">
            <Head title="Register">
                <script src="https://www.google.com/recaptcha/api.js" async defer />
            </Head>
            
            <div className="w-full max-w-6xl px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeInUp" style={{ minHeight: '500px' }}>
                    <div className="flex flex-col lg:flex-row">
                        {/* Left Image Column */}
                        <div className="lg:w-1/2 relative hidden lg:block animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                            <img 
                                src="/images/hero-image2.png" 
                                alt="Oxygen Tanks" 
                                className="w-full h-full object-cover"
                                style={{ minHeight: '500px' }}
                            />
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(30,136,229,0.3) 0%, rgba(30,136,229,0.1) 100%)'
                                }}
                            />
                        </div>
                        
                        {/* Right Form Column */}
                        <div className="lg:w-1/2 flex items-center justify-center p-3 md:p-4 bg-white">
                            <div className="w-full animate-fadeInUp" style={{ maxWidth: '350px', animationDelay: '0.4s' }}>
                                {/* Back to Home */}
                                <div className="mb-3 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                                    <a 
                                        href="/" 
                                        className="flex items-center gap-2 text-decoration-none transition-colors"
                                        style={{ color: '#1E88E5' }}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back to Home</span>
                                    </a>
                                </div>
                                
                                {/* Welcome Title */}
                                <div className="mb-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                                    <h1 
                                        className="fw-bold mb-1 italic"
                                        style={{ 
                                            fontSize: '2.5rem', 
                                            color: '#1E88E5'
                                        }}
                                    >
                                        Create Account
                                    </h1>
                                </div>

                                {/* Test OTP Code Alert */}
                                {testOtpCode && (
                                    <div className="alert alert-warning alert-dismissible fade show mb-3 animate-fadeIn" role="alert">
                                        <Info className="w-4 h-4 me-2" />
                                        <strong>For Testing:</strong> Your OTP code is <strong>{testOtpCode}</strong><br />
                                        <small>Email sending appears to have issues. Use this code to verify your account.</small>
                                        <button 
                                            type="button" 
                                            className="btn-close" 
                                            onClick={() => setTestOtpCode('')}
                                        />
                                    </div>
                                )}

                                {/* Session Status */}
                                {(status || otp_sent || otp_error) && (
                                    <div className={`alert ${otp_error ? 'alert-warning' : status || otp_sent ? 'alert-success' : 'alert-info'} mt-3 animate-fadeIn`} role="alert">
                                        {otp_error && <AlertTriangle className="w-4 h-4 me-2" />}
                                        {status && <CheckCircle className="w-4 h-4 me-2" />}
                                        {otp_sent && <Info className="w-4 h-4 me-2" />}
                                        {status || otp_sent || otp_error}
                                    </div>
                                )}

                                <form onSubmit={submit} className="animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                                    {/* Name */}
                                    <div className="mb-3">
                                        <Label htmlFor="name" className="form-label fw-semibold text-black">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #ddd'
                                            }}
                                            value={data.name}
                                            onChange={(e) => setData('name', capitalizeName(e.target.value))}
                                            required
                                            autoFocus
                                            placeholder="Enter your full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Email Address */}
                                    <div className="mb-3">
                                        <Label htmlFor="email" className="form-label fw-semibold text-black">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #ddd'
                                            }}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="mb-3">
                                        <Label htmlFor="phone" className="form-label fw-semibold text-black">
                                            Phone Number (Optional)
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            className="w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #ddd'
                                            }}
                                            value={data.phone || ''}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    {/* Password */}
                                    <div className="mb-3">
                                        <Label htmlFor="password" className="form-label fw-semibold text-black">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                className="w-full pr-12"
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
                                                    borderTop: '1px solid #ddd',
                                                    borderRight: '1px solid #ddd',
                                                    borderBottom: '1px solid #ddd',
                                                    borderLeft: 'none',
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

                                    {/* Confirm Password */}
                                    <div className="mb-4">
                                        <Label htmlFor="password_confirmation" className="form-label fw-semibold text-black">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="w-full pr-12"
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
                                                    borderTop: passwordMatch === 'match' ? '1px solid #198754' : passwordMatch === 'nomatch' ? '1px solid #dc3545' : '1px solid #ddd',
                                                    borderRight: passwordMatch === 'match' ? '1px solid #198754' : passwordMatch === 'nomatch' ? '1px solid #dc3545' : '1px solid #ddd',
                                                    borderBottom: passwordMatch === 'match' ? '1px solid #198754' : passwordMatch === 'nomatch' ? '1px solid #dc3545' : '1px solid #ddd',
                                                    borderLeft: 'none',
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
                                        <InputError message={errors.password_confirmation} />
                                        
                                        {/* Password Match Indicator */}
                                        <div className="mt-2">
                                            <div className="progress" style={{ height: '4px' }}>
                                                <div 
                                                    className="progress-bar" 
                                                    role="progressbar" 
                                                    style={{ 
                                                        width: passwordMatch !== 'empty' ? '100%' : '0%', 
                                                        transition: 'width 0.3s ease, background-color 0.3s ease',
                                                        backgroundColor: passwordMatch === 'match' ? '#198754' : passwordMatch === 'nomatch' ? '#dc3545' : '#e9ecef'
                                                    }}
                                                />
                                            </div>
                                            <small className={`mt-1 d-block ${passwordMatch === 'match' ? 'text-success fw-semibold' : passwordMatch === 'nomatch' ? 'text-danger fw-semibold' : 'text-muted'}`}>
                                                {passwordMatch === 'empty' && <><Info className="w-3 h-3 me-1" />Re-enter your password</>}
                                                {passwordMatch === 'match' && <><CheckCircle className="w-3 h-3 me-1" />Passwords match! ✓</>}
                                                {passwordMatch === 'nomatch' && <><X className="w-3 h-3 me-1" />Passwords do not match ✗</>}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Google reCAPTCHA v2 Checkbox */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-gray-600" />
                                            <span className="text-sm text-gray-700">Security Verification</span>
                                            {recaptchaToken && (
                                                <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                                            )}
                                        </div>
                                        
                                        {/* reCAPTCHA Widget - renders naturally via Google's script */}
                                        <div 
                                            className="g-recaptcha"
                                            data-sitekey="6LfhidMsAAAAAPtUEzZJNLgWwFo3dGD4EKGrviXZ"
                                            data-callback="onRecaptchaSuccess"
                                            data-expired-callback="onRecaptchaExpired"
                                            data-size="normal"
                                        ></div>
                                        
                                        {errors.recaptcha_token && (
                                            <InputError message={errors.recaptcha_token} />
                                        )}
                                    </div>

                                    {/* Register Button */}
                                    <Button
                                        type="submit"
                                        className="w-full fw-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        style={{
                                            backgroundColor: recaptchaToken ? '#42A5F5' : '#ccc',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            cursor: recaptchaToken ? 'pointer' : 'not-allowed'
                                        }}
                                        disabled={processing || !recaptchaToken}
                                    >
                                        {processing ? (
                                            <>
                                                <Hourglass className="w-4 h-4 mr-2 animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                {recaptchaToken ? 'Create Account' : 'Complete Security Verification'}
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Login Link */}
                                <div className="text-center mt-4 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                                    <p className="text-muted small mb-0" style={{ color: 'black' }}>
                                        Already have an account?{' '}
                                        <a 
                                            href={route('login')} 
                                            className="text-decoration-none fw-semibold transition-colors"
                                            style={{ color: '#194587' }}
                                        >
                                            Login
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">
                                    <Shield className="w-4 h-4 me-2" />
                                    Verify Your Email
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowOtpModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <div className="mb-3">
                                        <Mail className="w-16 h-16 text-info" />
                                    </div>
                                    <h6 className="fw-bold mb-3">Check Your Email</h6>
                                    <p className="text-muted mb-3">
                                        We've sent a 6-digit verification code to your email address.
                                    </p>
                                    <p className="text-muted mb-4">
                                        Please enter the code below to verify your account and complete registration.
                                    </p>
                                </div>
                                
                                <form onSubmit={handleOtpSubmit}>
                                    <div className="mb-3">
                                        <Label htmlFor="modalOtp" className="form-label fw-semibold text-black">
                                            Enter OTP Code
                                        </Label>
                                        <Input
                                            id="modalOtp"
                                            type="text"
                                            className="w-full text-center"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                fontSize: '1.2rem',
                                                letterSpacing: '2px'
                                            }}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full fw-semibold text-white"
                                        style={{
                                            backgroundColor: '#28a745',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '12px'
                                        }}
                                    >
                                        <Shield className="w-4 h-4 mr-2" />
                                        Verify Email & Login
                                    </Button>
                                </form>

                                {/* Resend OTP */}
                                <div className="text-center mt-3">
                                    <small className="text-muted">Didn't receive the code?</small><br />
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="btn btn-link p-0 text-info text-decoration-none"
                                    >
                                        <RotateCcw className="w-3 h-3 me-1" />
                                        Resend OTP
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowOtpModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Success Modal */}
            {showSuccessModal && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    <CheckCircle className="w-4 h-4 me-2" />
                                    Registration Successful!
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowSuccessModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <div className="mb-3">
                                        <Mail className="w-16 h-16 text-success" />
                                    </div>
                                    <h6 className="fw-bold mb-3">Please Verify Your Email</h6>
                                    <p className="text-muted mb-2">
                                        Thank you for registering! We've sent a verification code to your email address.
                                    </p>
                                    <p className="text-muted mb-3">
                                        Please check your inbox and enter the OTP code to verify your account before logging in.
                                    </p>
                                    <div className="alert alert-info border-0 bg-light">
                                        <Info className="w-4 h-4 me-2" />
                                        <small>If you don't see the email in your inbox, please check your spam folder.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    I Understand
                                </button>
                                <a 
                                    href={route('otp.verify')} 
                                    className="btn btn-success"
                                >
                                    <Shield className="w-4 h-4 me-2" />
                                    Verify Email Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
