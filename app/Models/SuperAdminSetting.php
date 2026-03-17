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
        return self::getPassword() !== null;
    }

    /**
     * Get the hashed password value.
     */
    public static function getPassword(): ?string
    {
        $configuredHash = config('super_admin.password_hash');

        if (is_string($configuredHash) && $configuredHash !== '') {
            return $configuredHash;
        }

        return self::where('key', 'password')->value('value');
    }

    /**
     * Determine whether interactive setup is explicitly allowed.
     */
    public static function isSetupAllowed(): bool
    {
        return ! self::hasPassword() && (bool) config('super_admin.allow_local_setup', false);
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
