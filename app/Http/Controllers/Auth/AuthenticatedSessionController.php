<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * Validates credentials, then sends OTP for 2FA before granting access.
     */
    public function store(LoginRequest $request): RedirectResponse|Response
    {
        $request->authenticate();

        // Credentials are valid — now log the user out temporarily and send OTP
        $user = Auth::user();
        Auth::guard('web')->logout();

        // Generate and cache a 6-digit OTP (valid for 10 minutes)
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        \Illuminate\Support\Facades\Cache::put("login_otp_{$user->id}", $otp, 600);

        // Send OTP email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OtpVerificationMail($otp, $user));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Login OTP email error: ' . $e->getMessage());
        }

        // Store pending login user id in session
        $request->session()->put('login_otp_user_id', $user->id);

        return Inertia::render('auth/login-otp', [
            'user_id' => (string) $user->id,
            'email' => $user->email,
            'otp_sent' => 'A verification code has been sent to your email.',
        ]);
    }

    /**
     * Verify login OTP and complete authentication.
     */
    public function verifyLoginOtp(Request $request): RedirectResponse|Response
    {
        $request->validate([
            'otp' => 'required|string|size:6',
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user_id;
        $cachedOtp = \Illuminate\Support\Facades\Cache::get("login_otp_{$userId}");

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code. Please try again.']);
        }

        // Clear OTP
        \Illuminate\Support\Facades\Cache::forget("login_otp_{$userId}");
        $request->session()->forget('login_otp_user_id');

        // Now fully authenticate the user
        $user = \App\Models\User::findOrFail($userId);
        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        // Log login activity
        Activity::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => "User {$user->name} logged in successfully (2FA verified)",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Store shift start time for cashiers
        if ($user->role === 'cashier') {
            $request->session()->put('shift_start_time', now()->setTimezone('Asia/Manila')->format('Y-m-d H:i:s'));
        }

        // Return Inertia response so frontend can show success modal before redirect
        return Inertia::render('auth/login-otp', [
            'user_id' => (string) $user->id,
            'email' => $user->email,
            'verified' => true,
            'redirect_url' => route($user->getDashboardRoute(), [], false),
        ]);
    }

    /**
     * Resend login OTP.
     */
    public function resendLoginOtp(Request $request): RedirectResponse|Response
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = \App\Models\User::findOrFail($request->user_id);

        // Generate new OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        \Illuminate\Support\Facades\Cache::put("login_otp_{$user->id}", $otp, 600);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OtpVerificationMail($otp, $user));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Login OTP resend error: ' . $e->getMessage());
        }

        return Inertia::render('auth/login-otp', [
            'user_id' => (string) $user->id,
            'email' => $user->email,
            'otp_sent' => 'A new verification code has been sent to your email.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Log logout activity before logging out
        $user = Auth::user();
        if ($user) {
            Activity::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'description' => "User {$user->name} logged out",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
