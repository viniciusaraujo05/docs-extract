# Plan Management System

## Overview
Centralized system for managing subscription plans with real-time Stripe integration.

## Structure

### Plan Configuration (`config/plans.php`)
- **FREE** - €0/month
  - 20 documents/month
  - 2 models
  - 1 report
  - 100 API requests/month
  - 1 API client
  - CSV & JSON exports
  - DOCSET branding

- **STARTER** - €25/month
  - 300 documents/month
  - 5 models
  - 5 reports
  - 3,000 API requests/month
  - 2 API clients
  - CSV, JSON & Excel exports
  - No branding
  - Standard support

- **PRO** - €49/month ⭐ (Recommended)
  - 1,500 documents/month
  - 20 models
  - Unlimited reports
  - 25,000 API requests/month
  - 5 API clients
  - All exports (CSV, JSON, Excel, XML)
  - Priority support
  - No branding

- **BUSINESS** - €99/month
  - 5,000+ documents/month
  - Unlimited models
  - Unlimited reports
  - 100,000+ API requests/month
  - 10 API clients
  - All exports
  - Webhooks (coming soon)
  - Basic SLA
  - Custom integrations

## Services

### StripePlanService
- Fetches real-time pricing from Stripe
- Caches plans for 1 hour
- Handles currency formatting
- Maps Stripe products to plan keys

**Usage:**
```php
$stripePlanService = app(StripePlanService::class);
$plans = $stripePlanService->getAllPlans();
$singlePlan = $stripePlanService->getPlan('pro');
$stripePlanService->clearCache(); // Force refresh
```

### SubscriptionService
- Manages user subscriptions
- Calculates usage percentages
- Checks plan limits
- Handles plan features

**Usage:**
```php
$subscriptionService = app(SubscriptionService::class);
$limits = $subscriptionService->getUserPlanLimits($user);
$hasReachedLimit = $subscriptionService->hasReachedLimit($user, 'documents');
$usagePercentage = $subscriptionService->getUsagePercentage($user, 'documents');
```

## API Endpoints

- `GET /{locale}/api/plans` - Get all available plans
- `GET /{locale}/api/plans/current` - Get current user's plan and usage
- `GET /{locale}/api/plans/upcoming-invoice` - Get upcoming invoice
- `GET /{locale}/api/plans/invoices` - Get invoice history

## Frontend Integration

### Welcome Page
- Uses `api/plans` to display pricing cards
- Handles upgrade flow

### Settings/Billing Page
- Shows current plan and usage
- Displays usage progress bars
- Lists invoices
- Provides upgrade options

## Limit Enforcement

### CheckPlanLimits Middleware
Applied to routes that need plan restrictions:
```php
Route::middleware(['auth', 'check.plan.limit:documents'])->group(function () {
    // Routes that consume document quota
});
```

### Usage Tracking
- Documents: Count in `documents` table
- Models: Count in `document_types` table
- API Requests: To be implemented with request logging
- API Keys: Count in `api_clients` table

## Cache Management

### Automatic
- Plans cache expires every hour
- Daily cache clear at midnight (scheduled)

### Manual
```bash
# Clear plans cache
php artisan plans:clear-cache

# Clear all application cache
php artisan cache:clear
```

## Environment Variables

Required in `.env`:
```env
STRIPE_KEY=pk_xxx
STRIPE_SECRET=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRODUCT_FREE=prod_xxx
STRIPE_PRODUCT_STARTER=prod_xxx
STRIPE_PRODUCT_PRO=prod_xxx
STRIPE_PRODUCT_BUSINESS=prod_xxx
```

## Future Enhancements

1. **Usage Tracking System**
   - API request logging
   - Monthly usage reset
   - Usage alerts and notifications

2. **Advanced Features**
   - Custom plan creation
   - Add-ons and extra quotas
   - Team seats management
   - Usage analytics dashboard

3. **Integration Points**
   - Webhooks for real-time updates
   - Usage-based billing
   - Trial management
   - Discount codes

## Testing

```bash
# Test plan fetching
curl -H "Accept: application/json" http://localhost/en/api/plans

# Test current plan (requires auth)
curl -H "Accept: application/json" -b "session=xxx" http://localhost/en/api/plans/current
```
