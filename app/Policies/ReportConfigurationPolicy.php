<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReportConfiguration;
use App\Models\User;

final class ReportConfigurationPolicy
{
    public function view(User $user, ReportConfiguration $configuration): bool
    {
        return $user->id === $configuration->user_id;
    }

    public function update(User $user, ReportConfiguration $configuration): bool
    {
        return $user->id === $configuration->user_id;
    }

    public function delete(User $user, ReportConfiguration $configuration): bool
    {
        return $user->id === $configuration->user_id;
    }
}
