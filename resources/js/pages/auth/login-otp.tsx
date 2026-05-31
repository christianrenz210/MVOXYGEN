import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle, Shield, Mail, ArrowLeft, RotateCcw, CheckCircle, Clock, CheckSquare } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginOtpProps {
    user_id: string;
    email: string;
    otp_sent?: string;
    verified?: boolean;
    redirect_url?: string;
}

export default function LoginOtp({ user_id, email, otp_sent, verified, redirect_url }: LoginOtpProps) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
        user_id: user_id || '',
    });

    const [resending, setResending] = useState(false);
    const [statusMessage, setStatusMessage] = useState(otp_sent || '');
    const [showSuccessModal, setShowSuccessModal] = useState(verified || false);

    useEffect(() => {
        if (otp_sent) {
            setStatusMessage(otp_sent);
        }
    }, [otp_sent]);

    useEffect(() => {
        if (verified) {
            setShowSuccessModal(true);
        }
    }, [verified]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.verify-otp'), {
            onError: (errors) => {
                console.error('Login OTP verification failed:', errors);
            },
        });
    };

    const handleResendOtp = () => {
        setResending(true);
        router.post(route('login.resend-otp'), { user_id: data.user_id }, {
            onSuccess: (page) => {
                const props = page.props as Record<string, unknown>;
                if (props.otp_sent) {
                    setStatusMessage(props.otp_sent as string);
                }
                setResending(false);
            },
            onError: () => {
                setResending(false);
            },
        });
    };

    // Mask email for display
    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-4">
            <Head title="Login Verification" />

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
                                <Shield className="w-10 h-10 text-white" />
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
                            Two-Factor Authentication
                        </h1>
                        <p className="text-gray-600 text-lg mb-2">
                            Enter the 6-digit code sent to your email
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
                            <Mail className="w-4 h-4" />
                            <span>{maskedEmail}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Code expires in 10 minutes</span>
                        </div>
                    </div>

                    {/* Status Message */}
                    {statusMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 relative z-10" role="alert">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-green-800">{statusMessage}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="relative z-10">
                        <input type="hidden" name="user_id" value={data.user_id} />

                        {/* OTP Code */}
                        <div className="mb-6">
                            <Label htmlFor="otp" className="form-label fw-semibold text-gray-800 text-lg mb-3 block">
                                Enter Verification Code
                            </Label>
                            <div className="relative">
                                <Input
                                    id="otp"
                                    type="text"
                                    className="w-full text-center text-2xl font-mono font-bold py-4 px-6 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-200"
                                    style={{
                                        letterSpacing: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                    value={data.otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setData('otp', value);
                                    }}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <InputError message={errors.otp} className="mt-2" />
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <CheckSquare className="w-4 h-4" />
                                <span>Check your email for the 6-digit code</span>
                            </div>
                        </div>

                        {/* Verify Button */}
                        <Button
                            type="submit"
                            className="w-full fw-semibold text-white mb-6 py-4 text-lg"
                            style={{
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(40, 167, 69, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                transition: 'all 0.3s ease',
                                cursor: processing ? 'not-allowed' : 'pointer'
                            }}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5 mr-2" />
                                    Verify & Login
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Resend OTP */}
                    <div className="text-center relative z-10">
                        <div className="text-gray-600 mb-2">
                            <small className="text-gray-500">Didn't receive the code?</small>
                        </div>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resending}
                            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                        >
                            {resending ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                            ) : (
                                <RotateCcw className="w-4 h-4" />
                            )}
                            Resend Code
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">
                                Login with OTP Successful!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Your identity has been verified. You will now be redirected to your dashboard.
                            </p>
                            <Button
                                type="button"
                                className="w-full py-3 text-lg text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(30, 136, 229, 0.25)'
                                }}
                                onClick={() => router.visit(redirect_url || '/')}
                            >
                                Continue to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
