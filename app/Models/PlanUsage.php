<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanUsage extends Model
{
    use HasFactory;

    protected $table = 'plan_usage';

    protected $fillable = [
        'user_id',
        'subscription_id',
        'billing_period',
        'documents_count',
        'models_count',
        'api_requests_count',
        'reports_count',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'period_start' => 'datetime',
        'period_end' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create usage record for current billing period
     */
    public static function getOrCreateForUser(User $user): self
    {
        $subscription = $user->subscription('default');

        // Use subscription created date as billing anchor, or user created date
        $billingAnchor = $subscription ? $subscription->created_at : $user->created_at;
        $billingAnchor->day(min($billingAnchor->day, 28)); // Ensure valid day for all months

        $now = now();
        $currentPeriodStart = $now->copy()->day($billingAnchor->day)->startOfDay();

        // If we're before the billing anchor this month, use last month
        if ($now->day < $billingAnchor->day) {
            $currentPeriodStart->subMonth();
        }

        $currentPeriodEnd = $currentPeriodStart->copy()->addMonth()->subSecond();
        $billingPeriod = $currentPeriodStart->format('Y-m');

        return self::firstOrCreate(
            [
                'user_id' => $user->id,
                'billing_period' => $billingPeriod,
            ],
            [
                'subscription_id' => $subscription?->stripe_id,
                'period_start' => $currentPeriodStart,
                'period_end' => $currentPeriodEnd,
            ]
        );
    }

    /**
     * Increment usage counter
     */
    public function incrementUsage(string $type, int $count = 1): bool
    {
        if (! in_array($type, ['documents', 'models', 'api_requests', 'reports'])) {
            return false;
        }

        $column = "{$type}_count";
        $this->increment($column, $count);

        return true;
    }

    /**
     * Decrement usage counter
     */
    public function decrementUsage(string $type, int $count = 1): bool
    {
        if (! in_array($type, ['documents', 'models', 'api_requests', 'reports'])) {
            return false;
        }

        $column = "{$type}_count";

        // Only decrement if current value is greater than 0
        if ($this->$column > 0) {
            $this->decrement($column, $count);

            return true;
        }

        return false;
    }

    /**
     * Get remaining quota for a resource
     */
    public function getRemaining(string $resource, int $limit): int
    {
        if ($limit === -1) {
            return -1; // unlimited
        }

        $used = $this->{"{$resource}_count"} ?? 0;

        return max(0, $limit - $used);
    }

    /**
     * Check if user has reached limit for a resource
     */
    public function hasReachedLimit(string $resource, int $limit): bool
    {
        if ($limit === -1) {
            return false; // unlimited
        }

        $used = $this->{"{$resource}_count"} ?? 0;

        return $used >= $limit;
    }
}
