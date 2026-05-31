import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Check, X, Lock, ArrowLeft } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: string | number | boolean | Blob | File | null | undefined;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

    const passwordRequirements = {
        minLength: { text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
        uppercase: { text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
        lowercase: { text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
        number: { text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
        special: { text: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
    };

    const calculatePasswordStrength = (password: string) => {
        const requirements = Object.values(passwordRequirements);
        const passedRequirements = requirements.filter(req => req.test(password));
        
        if (passedRequirements.length <= 2) return 'weak';
        if (passedRequirements.length <= 4) return 'medium';
        return 'strong';
    };

    useEffect(() => {
        if (data.password) {
            setPasswordStrength(calculatePasswordStrength(data.password));
        } else {
            setPasswordStrength(null);
        }
    }, [data.password]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-4">
            <Head title="Reset Password" />

            <div className="w-full max-w-lg px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full -ml-12 -mb-12 opacity-50"></div>

                    {/* Back to Login */}
                    <div className="mb-6 relative z-10">
                        <a
                            href={route('login')}
                            className="flex items-center gap-2 text-decoration-none hover:text-blue-600 transition-colors"
                            style={{ color: '#1E88E5' }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">Back to Login</span>
                        </a>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Lock className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1
                            className="fw-bold mb-3"
                            style={{
                                fontSize: '2.5rem',
                                color: '#1E88E5',
                                background: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Reset Password
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Please enter your new password below
                        </p>
                    </div>

                    <form onSubmit={submit} className="relative z-10">
                        {/* Email (read-only) */}
                        <div className="mb-4">
                            <Label htmlFor="email" className="font-semibold text-gray-800 mb-2 block">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={data.email}
                                className="w-full bg-gray-100 text-gray-600"
                                style={{ borderRadius: '8px', border: '1px solid #ddd' }}
                                readOnly
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* New Password */}
                        <div className="mb-4">
                            <Label htmlFor="password" className="font-semibold text-gray-800 mb-2 block">
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    className="w-full pr-12 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    style={{ borderRadius: '8px', border: '1px solid #ddd' }}
                                    autoFocus
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                    style={{
                                        borderRadius: '0 8px 8px 0',
                                        border: '1px solid #ddd',
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
                            <InputError message={errors.password} className="mt-2" />
                            
                            {/* Password Strength Indicator */}
                            {data.password && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                                                    passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                                                    'w-full bg-green-500'
                                                }`}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength === 'weak' ? 'text-red-500' :
                                            passwordStrength === 'medium' ? 'text-yellow-500' :
                                            'text-green-500'
                                        }`}>
                                            {passwordStrength?.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    {/* Password Requirements */}
                                    <div className="space-y-1">
                                        {Object.entries(passwordRequirements).map(([key, req]) => (
                                            <div key={key} className="flex items-center gap-2 text-xs">
                                                {req.test(data.password) ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <X className="h-3 w-3 text-gray-400" />
                                                )}
                                                <span className={req.test(data.password) ? 'text-green-600' : 'text-gray-500'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <Label htmlFor="password_confirmation" className="font-semibold text-gray-800 mb-2 block">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    className="w-full pr-12 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    style={{ borderRadius: '8px', border: '1px solid #ddd' }}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                    style={{
                                        borderRadius: '0 8px 8px 0',
                                        border: '1px solid #ddd',
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
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            className="w-full font-semibold text-white py-3 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                boxShadow: '0 10px 25px -5px rgba(30, 136, 229, 0.25)'
                            }}
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                            Reset Password
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
