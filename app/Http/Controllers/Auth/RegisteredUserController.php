<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Auth\OtpController;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'recaptcha_token' => 'required|string',
        ]);

        // Verify reCAPTCHA token
        $recaptchaToken = $request->input('recaptcha_token');
        $secretKey = '6LfhidMsAAAAAH5dJ0A5T5oxI_MruAAQDV89Lv_c';
        
        try {
            $response = \Illuminate\Support\Facades\Http::asForm()
                ->timeout(10)
                ->withOptions([
                    'verify' => false, // Disable SSL verification for localhost development
                    'curl' => [
                        100 => false, // CURLOPT_SSL_VERIFYPEER
                        101 => false, // CURLOPT_SSL_VERIFYHOST
                        28 => 10,    // CURLOPT_CONNECTTIMEOUT
                        13 => 15,    // CURLOPT_TIMEOUT
                    ]
                ])
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secretKey,
                    'response' => $recaptchaToken,
                ]);

            if (!$response->json('success')) {
                return back()->withErrors([
                    'recaptcha_token' => 'reCAPTCHA verification failed. Please try again.',
                ])->withInput();
            }
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('reCAPTCHA verification error: ' . $e->getMessage());
            
            // For development, allow the request to proceed
            if (app()->environment('local', 'testing')) {
                // In development, we can bypass reCAPTCHA on SSL errors
                // Continue with registration
            } else {
                return back()->withErrors([
                    'recaptcha_token' => 'Unable to verify reCAPTCHA. Please try again later.',
                ])->withInput();
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        event(new Registered($user));

        // Send OTP for email verification
        $otpController = app()->make(OtpController::class);
        $otpRequest = new Request(['user_id' => $user->id]);
        $otpResponse = $otpController->send($otpRequest);

        return Inertia::render('auth/email-verification-otp', [
            'otp_sent' => 'Please check your email for verification code.',
            'otp_code' => $otpResponse->getData(true)['otp_code'] ?? null,
            'user_id' => $user->id
        ]);
    }
}
