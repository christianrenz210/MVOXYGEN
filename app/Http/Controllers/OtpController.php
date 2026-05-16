<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpVerificationMail;

class OtpController extends Controller
{
    /**
     * Send OTP to email
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:customer_creation,supplier_creation,registration'
        ]);

        $email = $request->email;
        $type = $request->type;

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in session with expiration (10 minutes)
        $sessionKey = "otp_{$type}_{$email}";
        $expiresKey = "otp_{$type}_{$email}_expires";
        
        session([$sessionKey => $otp]);
        session([$expiresKey => now()->addMinutes(10)]);

        try {
            // Create a simple user object for the mail
            $user = new \stdClass();
            $user->name = 'Customer';
            $user->email = $email;

            Mail::to($email)->send(new OtpVerificationMail($otp, $user));

            return response()->json([
                'success' => true,
                'message' => 'OTP sent successfully to your email',
                'expires_at' => now()->addMinutes(10)->toISOString()
            ]);

        } catch (\Exception $e) {
            // Log detailed error for debugging
            \Log::error('OTP Email Sending Failed', [
                'email' => $email,
                'type' => $type,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'mail_config' => [
                    'mailer' => config('mail.mailer'),
                    'host' => config('mail.host'),
                    'port' => config('mail.port'),
                    'username' => config('mail.username'),
                    'encryption' => config('mail.encryption'),
                    'from_address' => config('mail.from.address'),
                ]
            ]);

            // Return detailed error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP email. Please check your email configuration.',
                'error' => $e->getMessage(),
                'error_type' => get_class($e),
                'test_otp' => $otp, // Include for testing if email fails
                'debug_info' => [
                    'mail_config_loaded' => !empty(config('mail.host')),
                    'mail_host' => config('mail.host'),
                    'mail_port' => config('mail.port'),
                ]
            ], 500);
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'type' => 'required|in:customer_creation,supplier_creation,registration'
        ]);

        $email = $request->email;
        $otp = $request->otp;
        $type = $request->type;

        $sessionKey = "otp_{$type}_{$email}";
        $expiresKey = "otp_{$type}_{$email}_expires";

        // Check if OTP exists
        if (!session()->has($sessionKey)) {
            return response()->json([
                'success' => false,
                'message' => 'OTP not found or expired. Please request a new OTP.'
            ]);
        }

        // Check if OTP has expired
        if (now()->greaterThan(session($expiresKey))) {
            // Clear expired OTP
            session()->forget([$sessionKey, $expiresKey]);
            
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new OTP.'
            ]);
        }

        // Verify OTP
        $storedOtp = session($sessionKey);
        if ($storedOtp !== $otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP. Please try again.'
            ]);
        }

        // OTP is valid, clear it from session
        session()->forget([$sessionKey, $expiresKey]);

        // Mark email as verified for this session
        session(["email_verified_{$type}_{$email}" => true]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        // This is essentially the same as sendOtp, but we might want to add
        // rate limiting or additional checks in production
        
        return $this->sendOtp($request);
    }

    /**
     * Check if email is verified for a specific type
     */
    public static function isEmailVerified($email, $type)
    {
        $sessionKey = "email_verified_{$type}_{$email}";
        return session()->has($sessionKey) && session($sessionKey) === true;
    }

    /**
     * Clear email verification for a specific type
     */
    public static function clearEmailVerification($email, $type)
    {
        $sessionKey = "email_verified_{$type}_{$email}";
        session()->forget($sessionKey);
    }
}
