<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Api\CreateApiClientAction;
use App\Actions\Api\RegenerateApiClientSecretAction;
use App\Http\Requests\StoreApiClientRequest;
use App\Models\ApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiClientController extends Controller
{
    public function __construct(
        private readonly CreateApiClientAction $createApiClientAction,
        private readonly RegenerateApiClientSecretAction $regenerateApiClientSecretAction,
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

        $webhooks = \App\Models\WebhookEndpoint::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('api/index', [
            'locale' => $locale,
            'clients' => $clients,
            'webhooks' => $webhooks,
        ]);
    }

    public function store(StoreApiClientRequest $request): RedirectResponse
    {
        $user = $request->user();

        $result = $this->createApiClientAction->execute(
            user: $user,
            name: $request->validated('name'),
            contactEmail: $request->validated('contact_email'),
            userAgent: $request->userAgent()
        );

        $client = $result['client'];
        $plainSecret = $result['plainTextSecret'];

        // SECURITY: Use one-time flash for sensitive data
        // The secret will only be available once and then removed
        return back()->with([
            'success' => 'API Client created successfully!',
            'newClient' => [
                'id' => $client->id,
                'public_id' => $client->public_id,
                'name' => $client->name,
                'client_id' => $client->client_id,
                'status' => $client->status,
                'created_at' => $client->created_at?->toISOString(),
            ],
        ])->with('client_secret_once', $plainSecret);
    }

    public function destroy(Request $request, ApiClient $apiClient): RedirectResponse
    {
        $this->authorize('delete', $apiClient);

        $apiClient->delete();

        return back()->with('success', 'API Client deleted successfully.');
    }

    public function regenerate(Request $request, ApiClient $apiClient): RedirectResponse
    {
        $this->authorize('update', $apiClient);

        $plainSecret = $this->regenerateApiClientSecretAction->execute($apiClient);

        // SECURITY: Use one-time flash for sensitive data
        // The secret will only be available once and then removed
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
