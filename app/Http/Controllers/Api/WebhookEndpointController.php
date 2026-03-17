<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookEndpoint;
use App\Services\WebhookUrlGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WebhookEndpointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $webhooks = WebhookEndpoint::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($webhooks);
    }

    public function store(Request $request, WebhookUrlGuard $webhookUrlGuard): RedirectResponse
    {
        $validated = $request->validate([
            'url' => 'required|url|max:255',
            'events' => 'nullable|array',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            $webhookUrlGuard->assertCanBeStored($validated['url']);
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'url' => $e->getMessage(),
            ]);
        }

        $webhook = new WebhookEndpoint;
        $webhook->user_id = $request->user()->id;
        $webhook->url = $validated['url'];
        $webhook->events = $validated['events'] ?? ['document.created', 'document.updated', 'document.deleted'];
        $webhook->is_active = true;
        $webhook->save();

        return back();
    }

    public function destroy(Request $request, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        if ($webhookEndpoint->user_id !== $request->user()->id) {
            abort(403);
        }

        $webhookEndpoint->delete();

        return back();
    }

    public function regenerateSecret(Request $request, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        if ($webhookEndpoint->user_id !== $request->user()->id) {
            abort(403);
        }

        $webhookEndpoint->secret = Str::random(32);
        $webhookEndpoint->save();

        return back();
    }
}
