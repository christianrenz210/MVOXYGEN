import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                autoComplete="new-password"
                                value={data.password}
                                className="mt-1 block w-full pr-10"
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                        
                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="space-y-2">
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

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                className="mt-1 block w-full pr-10"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{
                            backgroundColor: '#42A5F5',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px'
                        }}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
