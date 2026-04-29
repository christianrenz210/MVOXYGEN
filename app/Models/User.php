<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'profile_image',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        // Check if user has admin role
        if (isset($this->role) && $this->role === 'admin') {
            return true;
        }
        
        // You can modify this logic based on your admin determination
        // For now, let's assume admins have email addresses with specific domains or specific emails
        $adminEmails = [
            'admin@example.com',
            'admin@mvoxygen.com',
            'superadmin@mvoxygen.com',
            // Add more admin emails as needed
        ];
        
        return in_array($this->email, $adminEmails) || 
               str_ends_with($this->email, '@admin.mvoxygen.com');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the supplier profile for the user.
     */
    public function supplier()
    {
        return $this->hasOne(Supplier::class, 'user_id');
    }

    /**
     * Get the unread notifications for the user.
     */
    public function unreadNotifications(): HasMany
    {
        return $this->hasMany(Notification::class)->where('read', false)->orderBy('created_at', 'desc');
    }

    /**
     * Get the count of unread notifications.
     */
    public function getUnreadNotificationsCount(): int
    {
        return $this->unreadNotifications()->count();
    }

    /**
     * Get appropriate dashboard route for the user
     */
    public function getDashboardRoute(): string
    {
        // Admin users go to admin dashboard
        if ($this->isAdmin()) {
            return 'dashboard';
        }
        
        // Vendor/Supplier users go to supplier dashboard
        if ($this->role === 'vendor') {
            return 'supplier.dashboard';
        }
        
        // Customer users go to user dashboard
        return 'user.dashboard';
    }
}
