<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'recaptcha_token' => ['required', 'string', function ($attribute, $value, $fail) {
                // Temporarily bypass reCAPTCHA verification for development
                if (app()->environment('local', 'testing')) {
                    // In development, skip reCAPTCHA verification entirely
                    return;
                }

                if (!$value) {
                    $fail('Please complete the reCAPTCHA verification.');
                    return;
                }

                try {
                    $response = \Http::timeout(10)
                        ->withOptions([
                            'verify' => false, // Disable SSL verification for localhost development
                            'curl' => [
                                CURLOPT_SSL_VERIFYPEER => false,
                                CURLOPT_SSL_VERIFYHOST => false,
                                CURLOPT_CONNECTTIMEOUT => 10,
                                CURLOPT_TIMEOUT => 15,
                            ]
                        ])
                        ->post('https://www.google.com/recaptcha/api/siteverify', [
                            'secret' => '6LfhidMsAAAAAH5dJ0A5T5oxI_MruAAQDV89Lv_c',
                            'response' => $value,
                            'remoteip' => request()->ip(),
                        ]);

                    if (!$response->json()['success']) {
                        $fail('reCAPTCHA verification failed. Please try again.');
                    }
                } catch (\Exception $e) {
                    // Log the error for debugging
                    \Log::error('reCAPTCHA verification error: ' . $e->getMessage());
                    
                    $fail('Unable to verify reCAPTCHA. Please try again later.');
                }
            }],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Get user credentials
        $credentials = $this->only('email', 'password');

        // Check if user exists and is not archived or inactive before attempting authentication
        $user = \App\Models\User::where('email', $credentials['email'])->first();
        if ($user) {
            if ($user->status === 'archived') {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'Your account has been archived. Please contact the administrator.',
                ]);
            }

            if ($user->status === 'inactive') {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'Your account is inactive. Please contact the administrator.',
                ]);
            }
        }

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
