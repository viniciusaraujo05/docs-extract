<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\ApiClient;
use App\Repositories\ApiClientRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ApiClientController extends Controller
{
    public function __construct(
        private readonly ApiClientRepository $repository,
    ) {}

    public function index(Request $request, string $locale): Response
    {
        $user = $request->user();

        $clients = ApiClient::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ApiClient $client) => [
                'id' => $client->id,
                'public_id' => $client->public_id,
                'name' => $client->name,
                'client_id' => $client->client_id,
                'status' => $client->status,
                'rate_limit_per_minute' => $client->rate_limit_per_minute,
                'last_used_at' => $client->last_used_at?->toISOString(),
                'created_at' => $client->created_at?->toISOString(),
            ]);

        return Inertia::render('api/index', [
            'locale' => $locale,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request, string $locale): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
        ]);

        $name = $validated['name'] ?? null;
        if ($name === null || trim($name) === '') {
            $name = 'API Client - '.$user->name;
        }

        $contactEmail = $validated['contact_email'] ?? $user->email;
        $plainSecret = Str::random(40);

        $client = $this->repository->create([
            'user_id' => $user->id,
            'name' => $name,
            'contact_email' => $contactEmail,
            'client_id' => 'client_'.Str::random(32),
            'client_secret' => $plainSecret,
            'status' => 'active',
            'rate_limit_per_minute' => 60,
            'metadata' => [
                'created_via' => 'web',
                'user_agent' => $request->userAgent(),
            ],
        ]);

        return back()->with([
            'success' => 'API Client created successfully!',
            'newClient' => [
                'id' => $client->id,
                'public_id' => $client->public_id,
                'name' => $client->name,
                'client_id' => $client->client_id,
                'client_secret' => $plainSecret,
                'status' => $client->status,
                'created_at' => $client->created_at?->toISOString(),
            ],
        ]);
    }

    public function destroy(Request $request, string $locale, ApiClient $apiClient): RedirectResponse
    {
        $user = $request->user();

        if ($apiClient->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $this->repository->delete($apiClient);

        return back()->with('success', 'API Client deleted successfully.');
    }

    public function regenerate(Request $request, string $locale, ApiClient $apiClient): RedirectResponse
    {
        $user = $request->user();

        if ($apiClient->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $plainSecret = Str::random(40);

        $this->repository->update($apiClient, [
            'client_secret' => $plainSecret,
        ]);

        return back()->with([
            'success' => 'API Client secret regenerated successfully!',
            'newClient' => [
                'id' => $apiClient->id,
                'public_id' => $apiClient->public_id,
                'name' => $apiClient->name,
                'client_id' => $apiClient->client_id,
                'client_secret' => $plainSecret,
                'status' => $apiClient->status,
                'created_at' => $apiClient->created_at?->toISOString(),
            ],
        ]);
    }
}
