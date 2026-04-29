<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class AdminController extends Controller
{
    /**
     * Show admin settings page
     */
    public function settings()
    {
        return Inertia::render('admin/settings', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/dashboard'],
                ['title' => 'Admin Settings', 'href' => '/admin/settings']
            ],
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Update admin profile image
     */
    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $user = auth()->user();

        \Log::info('Profile image upload attempt for user: ' . $user->id);

        if ($request->hasFile('profile_image')) {
            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('profile-images')) {
                Storage::disk('public')->makeDirectory('profile-images');
                \Log::info('Created profile-images directory');
            }

            // Delete old profile image if exists
            if ($user->profile_image) {
                $oldPath = str_replace('/storage/', '', $user->profile_image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                    \Log::info('Deleted old profile image: ' . $oldPath);
                }
            }

            // Store new profile image
            $file = $request->file('profile_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('profile-images', $filename, 'public');
            $fullPath = '/storage/' . $path;
            $user->update(['profile_image' => $fullPath]);

            \Log::info('Profile image uploaded successfully: ' . $fullPath);
        }

        return redirect()->back()->with('success', 'Profile image updated successfully!');
    }

    /**
     * Create database backup and download
     */
    public function backup(Request $request)
    {
        try {
            // Get database configuration
            $database = config('database.connections.mysql.database');
            $username = config('database.connections.mysql.username');
            $password = config('database.connections.mysql.password');
            $host = config('database.connections.mysql.host');
            $port = config('database.connections.mysql.port', 3306);

            \Log::info("Starting backup for database: {$database}");

            // Create backup filename with timestamp
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "backup_{$timestamp}.sql";

            // Ensure backups directory exists in public storage
            if (!Storage::disk('public')->exists('backups')) {
                Storage::disk('public')->makeDirectory('backups');
                \Log::info("Created backups directory");
            }

            // Create backup using PHP
            $sql = "-- Database Backup: {$database}\n";
            $sql .= "-- Generated: " . now()->toDateTimeString() . "\n";
            $sql .= "-- --------------------------------------------------------\n\n";

            // Get all tables
            $tables = DB::select('SHOW TABLES');
            $tables = array_map('current', (array) $tables);

            foreach ($tables as $table) {
                $sql .= "-- Table structure for `{$table}`\n";
                $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";

                $createTable = DB::select("SHOW CREATE TABLE `{$table}`");
                $sql .= $createTable[0]->{'Create Table'} . ";\n\n";

                // Get table data
                $rows = DB::table($table)->get();
                foreach ($rows as $row) {
                    $values = [];
                    foreach ((array) $row as $value) {
                        if ($value === null) {
                            $values[] = 'NULL';
                        } else {
                            $values[] = "'" . addslashes($value) . "'";
                        }
                    }
                    $columns = implode('`, `', array_keys((array) $row));
                    $valuesStr = implode(', ', $values);
                    $sql .= "INSERT INTO `{$table}` (`{$columns}`) VALUES ({$valuesStr});\n";
                }
                $sql .= "\n";
            }

            \Log::info("Backup created, size: " . strlen($sql) . " bytes");

            // Save backup file to public storage
            Storage::disk('public')->put("backups/{$filename}", $sql);

            \Log::info("Backup saved to: backups/{$filename}");

            // Return success with file info for download
            return back()->with('success', 'Backup created successfully!')->with('download_file', $filename);

        } catch (\Exception $e) {
            \Log::error("Backup exception: " . $e->getMessage());
            return back()->with('error', 'Failed to create backup: ' . $e->getMessage());
        }
    }

    /**
     * Restore database from backup file
     */
    public function restore(Request $request)
    {
        try {
            $request->validate([
                'backup_file' => 'required|file|mimes:sql',
            ]);

            $file = $request->file('backup_file');
            $sqlContent = file_get_contents($file->getPathname());

            \Log::info("Starting database restore from backup file");

            // Split SQL into individual statements
            $statements = $this->splitSqlStatements($sqlContent);

            DB::beginTransaction();

            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (empty($statement) || strpos($statement, '--') === 0) {
                    continue;
                }

                try {
                    DB::statement($statement);
                } catch (\Exception $e) {
                    \Log::warning("Statement failed: " . $statement . " - Error: " . $e->getMessage());
                }
            }

            DB::commit();

            \Log::info("Database restored successfully");

            return back()->with('success', 'Database restored successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Restore exception: " . $e->getMessage());
            return back()->with('error', 'Failed to restore database: ' . $e->getMessage());
        }
    }

    /**
     * Split SQL content into individual statements
     */
    private function splitSqlStatements($sql)
    {
        $statements = [];
        $currentStatement = '';
        $delimiter = ';';
        $inString = false;
        $stringChar = '';
        $escaped = false;

        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];

            if ($escaped) {
                $currentStatement .= $char;
                $escaped = false;
                continue;
            }

            if ($char === '\\') {
                $currentStatement .= $char;
                $escaped = true;
                continue;
            }

            if ($inString) {
                $currentStatement .= $char;
                if ($char === $stringChar) {
                    $inString = false;
                }
                continue;
            }

            if ($char === '"' || $char === "'") {
                $inString = true;
                $stringChar = $char;
                $currentStatement .= $char;
                continue;
            }

            if ($char === $delimiter) {
                $statements[] = $currentStatement;
                $currentStatement = '';
                continue;
            }

            $currentStatement .= $char;
        }

        if (!empty($currentStatement)) {
            $statements[] = $currentStatement;
        }

        return $statements;
    }

    /**
     * List all backups
     */
    public function listBackups()
    {
        try {
            $backups = [];
            if (Storage::disk('public')->exists('backups')) {
                $files = Storage::disk('public')->files('backups');
                foreach ($files as $file) {
                    $backups[] = [
                        'filename' => basename($file),
                        'size' => Storage::disk('public')->size($file),
                        'created_at' => Storage::disk('public')->lastModified($file),
                    ];
                }
            }

            return response()->json(['backups' => $backups]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download backup file
     */
    public function downloadBackup($filename)
    {
        try {
            $path = "backups/{$filename}";
            
            if (!Storage::disk('public')->exists($path)) {
                return redirect()->back()->with('error', 'Backup file not found.');
            }

            return Storage::disk('public')->download($path);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to download backup: ' . $e->getMessage());
        }
    }

    /**
     * Delete backup file
     */
    public function deleteBackup($filename)
    {
        try {
            $path = "backups/{$filename}";
            
            if (!Storage::disk('public')->exists($path)) {
                return redirect()->back()->with('error', 'Backup file not found.');
            }

            Storage::disk('public')->delete($path);

            return redirect()->back()->with('success', 'Backup deleted successfully!');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete backup: ' . $e->getMessage());
        }
    }
}
