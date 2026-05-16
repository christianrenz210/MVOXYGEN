import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Mail, Shield, ArrowLeft, RefreshCw } from 'lucide-react';

interface OtpVerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    email: string;
    onVerified: () => void;
    onCancel: () => void;
    onBack: () => void;
}

export default function OtpVerificationModal({ 
    open, 
    onOpenChange, 
    email, 
    onVerified, 
    onCancel, 
    onBack 
}: OtpVerificationModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0 && !canResend) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
    }, [timeLeft, canResend]);

    // Format time display
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.slice(0, 6).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (i < 6) newOtp[i] = digit;
            });
            setOtp(newOtp);
            
            // Focus the last filled input
            const lastFilledIndex = newOtp.findIndex(d => d === '');
            const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
            const input = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement;
            if (input) input.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
                if (nextInput) nextInput.focus();
            }
        }
        
        setError('');
    };

    // Handle key press
    const handleKeyPress = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
            if (prevInput) prevInput.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        handleOtpChange(0, pastedData);
    };

    // Verify OTP
    const handleVerify = async () => {
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch('/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email: email,
                    otp: otpCode,
                    type: 'customer_creation'
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onVerified();
                }, 1500);
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await fetch('/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email: email,
                    type: 'customer_creation'
                })
            });

            const data = await response.json();

            if (data.success) {
                setOtp(['', '', '', '', '', '']);
                setTimeLeft(600);
                setCanResend(false);
                setError('');

                // Focus first input
                const firstInput = document.getElementById('otp-0') as HTMLInputElement;
                if (firstInput) firstInput.focus();
            } else {
                console.error('=== OTP RESEND ERROR ===');
                console.error('Error Message:', data.message);
                console.error('Error Details:', data.error);
                console.error('Error Type:', data.error_type);
                console.error('Debug Info:', data.debug_info);
                console.error('Test OTP:', data.test_otp);
                console.error('======================');
                
                setError(data.message || 'Failed to resend OTP');
                alert(`Error resending OTP: ${data.message}\n\nError: ${data.error}\n\nTest OTP: ${data.test_otp}`);
            }
        } catch (err) {
            console.error('=== OTP RESEND NETWORK ERROR ===');
            console.error('Network Error:', err);
            console.error('================================');
            
            setError('Failed to resend OTP. Please try again.');
            alert(`Network error resending OTP: ${err}`);
        } finally {
            setIsResending(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        if (!isVerifying && !isResending) {
            onCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Verify Your Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {!success ? (
                        <>
                            <div className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Check your email</h3>
                                    <p className="text-sm text-gray-600">
                                        We sent a 6-digit verification code to<br />
                                        <span className="font-medium text-gray-900">{email}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">
                                    Enter verification code
                                </Label>
                                <div className="flex justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyPress(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            disabled={isVerifying || isResending}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="text-sm text-red-600 text-center">{error}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    onClick={handleVerify}
                                    disabled={isVerifying || otp.join('').length !== 6}
                                    className="w-full"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                                </Button>

                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onBack}
                                        disabled={isVerifying || isResending}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleResend}
                                        disabled={!canResend || isResending || isVerifying}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                                        {isResending ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Email Verified!</h3>
                                <p className="text-sm text-gray-600">
                                    Your email has been successfully verified.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
