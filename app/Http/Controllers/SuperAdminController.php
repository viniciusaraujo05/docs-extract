<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DemoUsage;
use App\Models\Document;
use App\Models\PlanUsage;
use App\Models\SuperAdminSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    /**
     * Main page — decides which mode to render (setup / login / dashboard).
     */
    public function index(Request $request): Response
    {
        $hasPassword = SuperAdminSetting::hasPassword();
        $isAuthenticated = $request->session()->get('super_admin_authenticated', false);

        if (! $hasPassword) {
            return Inertia::render('super-admin', [
                'mode' => SuperAdminSetting::isSetupAllowed() ? 'setup' : 'disabled',
            ]);
        }

        if (! $isAuthenticated) {
            return Inertia::render('super-admin', [
                'mode' => 'login',
            ]);
        }

        // Dashboard mode — send stats
        $stats = $this->getDashboardStats();

        return Inertia::render('super-admin', [
            'mode' => 'dashboard',
            'stats' => $stats,
        ]);
    }

    /**
     * Set the admin password (first-time setup only).
     */
    public function setup(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! SuperAdminSetting::isSetupAllowed()) {
            abort(403, 'Super admin setup is disabled.');
        }

        if (SuperAdminSetting::hasPassword()) {
            return redirect('/admin-030399');
        }

        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        SuperAdminSetting::setPassword($request->input('password'));
        $request->session()->regenerate();
        $request->session()->put('super_admin_authenticated', true);

        return redirect('/admin-030399');
    }

    /**
     * Login with existing password.
     */
    public function login(Request $request): \Illuminate\Http\RedirectResponse
    {
        if (! SuperAdminSetting::hasPassword()) {
            return redirect('/admin-030399')->withErrors([
                'password' => 'Super admin access is not configured.',
            ]);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        $key = 'admin-login:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return redirect('/admin-030399')->withErrors([
                'password' => "Too many attempts. Try again in {$seconds} seconds.",
            ]);
        }

        if (! SuperAdminSetting::verifyPassword($request->input('password'))) {
            RateLimiter::hit($key, 900); // 15-minute decay

            return redirect('/admin-030399')->withErrors(['password' => 'Incorrect password.']);
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();
        $request->session()->put('super_admin_authenticated', true);

        return redirect('/admin-030399');
    }

    /**
     * API: paginated user list with usage data.
     */
    public function users(Request $request): JsonResponse
    {
        if (! $request->session()->get('super_admin_authenticated')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $search = $request->input('search', '');

        $query = User::query()
            ->withCount('documents')
            ->with(['connectedAccounts']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        // Augment with current period usage and Stripe info
        $users->getCollection()->transform(function (User $user) {
            $usage = PlanUsage::where('user_id', $user->id)
                ->orderBy('period_start', 'desc')
                ->first();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toDateTimeString(),
                'email_verified' => $user->email_verified_at !== null,
                'has_stripe' => $user->stripe_id !== null,
                'stripe_id' => $user->stripe_id,
                'documents_count' => $user->documents_count,
                'usage' => $usage ? [
                    'billing_period' => $usage->billing_period,
                    'documents_count' => $usage->documents_count,
                    'models_count' => $usage->models_count,
                    'api_requests_count' => $usage->api_requests_count,
                    'reports_count' => $usage->reports_count,
                    'period_start' => $usage->period_start?->toDateTimeString(),
                    'period_end' => $usage->period_end?->toDateTimeString(),
                ] : null,
            ];
        });

        return response()->json($users);
    }

    /**
     * API: detailed user info.
     */
    public function userDetail(Request $request, int $id): JsonResponse
    {
        if (! $request->session()->get('super_admin_authenticated')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = User::withCount('documents')->findOrFail($id);

        $allUsage = PlanUsage::where('user_id', $user->id)
            ->orderBy('period_start', 'desc')
            ->get()
            ->map(fn (PlanUsage $u) => [
                'billing_period' => $u->billing_period,
                'documents_count' => $u->documents_count,
                'models_count' => $u->models_count,
                'api_requests_count' => $u->api_requests_count,
                'reports_count' => $u->reports_count,
                'period_start' => $u->period_start?->toDateTimeString(),
                'period_end' => $u->period_end?->toDateTimeString(),
            ]);

        $recentDocs = Document::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'original_filename', 'status', 'created_at', 'mime_type', 'file_size']);

        $subscription = $user->subscription('default');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at->toDateTimeString(),
            'email_verified' => $user->email_verified_at !== null,
            'has_stripe' => $user->stripe_id !== null,
            'stripe_id' => $user->stripe_id,
            'documents_count' => $user->documents_count,
            'subscription' => $subscription ? [
                'stripe_id' => $subscription->stripe_id,
                'stripe_status' => $subscription->stripe_status,
                'created_at' => $subscription->created_at->toDateTimeString(),
            ] : null,
            'usage_history' => $allUsage,
            'recent_documents' => $recentDocs,
        ]);
    }

    /**
     * Build dashboard stats.
     */
    private function getDashboardStats(): array
    {
        $totalUsers = User::count();
        $totalDocuments = Document::count();
        $totalDemoUsages = DemoUsage::count();
        $demoSuccess = DemoUsage::where('success', true)->count();
        $demoFailed = DemoUsage::where('success', false)->count();
        $usersWithStripe = User::whereNotNull('stripe_id')->count();

        $recentDemos = DemoUsage::orderBy('created_at', 'desc')
            ->limit(50)
            ->get(['id', 'ip_address', 'filename', 'mime_type', 'file_size', 'success', 'created_at']);

        // Demo usage per day (last 30 days)
        $demoPerDay = DemoUsage::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            'total_users' => $totalUsers,
            'total_documents' => $totalDocuments,
            'total_demo_usages' => $totalDemoUsages,
            'demo_success' => $demoSuccess,
            'demo_failed' => $demoFailed,
            'users_with_stripe' => $usersWithStripe,
            'recent_demos' => $recentDemos,
            'demo_per_day' => $demoPerDay,
        ];
    }
}
