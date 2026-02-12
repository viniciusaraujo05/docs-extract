<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class SuperAdminSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Check if a super admin password has been set.
     */
    public static function hasPassword(): bool
    {
        return self::where('key', 'password')->exists();
    }

    /**
     * Get the hashed password value.
     */
    public static function getPassword(): ?string
    {
        return self::where('key', 'password')->value('value');
    }

    /**
     * Set (or update) the super admin password.
     */
    public static function setPassword(string $plainPassword): void
    {
        self::updateOrCreate(
            ['key' => 'password'],
            ['value' => Hash::make($plainPassword)]
        );
    }

    /**
     * Verify a plain password against the stored hash.
     */
    public static function verifyPassword(string $plainPassword): bool
    {
        $hashed = self::getPassword();

        if ($hashed === null) {
            return false;
        }

        return Hash::check($plainPassword, $hashed);
    }
}
