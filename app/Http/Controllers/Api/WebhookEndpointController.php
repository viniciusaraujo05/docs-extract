<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookEndpointController extends Controller
{
    public function index(Request $request, string $locale): JsonResponse
    {
        $webhooks = WebhookEndpoint::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($webhooks);
    }

    public function store(Request $request, string $locale): RedirectResponse
    {
        $validated = $request->validate([
            'url' => 'required|url|max:255',
            'events' => 'nullable|array',
            'description' => 'nullable|string|max:255',
        ]);

        $webhook = new WebhookEndpoint;
        $webhook->user_id = $request->user()->id;
        $webhook->url = $validated['url'];
        $webhook->events = $validated['events'] ?? ['document.created', 'document.updated', 'document.deleted'];
        $webhook->is_active = true;
        $webhook->save();

        return back();
    }

    public function destroy(Request $request, string $locale, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        if ($webhookEndpoint->user_id !== $request->user()->id) {
            abort(403);
        }

        $webhookEndpoint->delete();

        return back();
    }

    public function regenerateSecret(Request $request, string $locale, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        if ($webhookEndpoint->user_id !== $request->user()->id) {
            abort(403);
        }

        $webhookEndpoint->secret = Str::random(32);
        $webhookEndpoint->save();

        return back();
    }
}
