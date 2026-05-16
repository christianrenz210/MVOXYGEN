<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(): Response
    {
        $suppliers = Supplier::orderBy('created_at', 'desc')->get();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Show the form for creating a new supplier.
     */
    public function create(): Response
    {
        return Inertia::render('suppliers/create', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Store a newly created supplier in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'plant_name' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        try {
            // Create supplier record
            $supplier = Supplier::create([
                'name' => $validated['name'],
                'plant_name' => $validated['plant_name'] ?? null,
                'address' => $validated['address'],
                'contact_person' => $validated['contact_person'],
                'contact_number' => $validated['contact_number'],
                'email' => $validated['email'],
                'notes' => $validated['notes'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create user account for the supplier
            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'supplier',
                'supplier_id' => $supplier->id,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Send OTP for email verification (similar to registration)
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Store OTP in session or database (using session for now)
            session(['user_otp_' . $user->id => $otp]);
            session(['user_otp_expires_' . $user->id => now()->addMinutes(10)]);

            // Send OTP email (you would implement email sending here)
            // For now, we'll just store it in session for testing
            session(['test_otp_' . $user->id => $otp]);

            // Log in the user automatically
            Auth::login($user);

            return redirect()->route('suppliers.index')->with('success', 'Supplier successfully added! User account created and OTP sent.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create supplier. Please try again.']);
        }
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Update the specified supplier in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'plant_name' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier->update($request->all());

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified supplier from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }
}
