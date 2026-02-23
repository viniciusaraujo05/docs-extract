<?php

namespace App\Http\Controllers\Webhook;

use App\Actions\Blog\UpsertBlogPostAction;
use App\DataTransferObjects\IncomingBlogPostDTO;
use App\Http\Controllers\Controller;
use App\Models\SuperAdminSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogWebhookController extends Controller
{
    public function sync(Request $request, UpsertBlogPostAction $action): JsonResponse
    {
        $providedToken = $request->bearerToken();
        $storedHash = SuperAdminSetting::where('key', 'blog_webhook_token')->value('value');

        if (! $storedHash || ! $providedToken || hash('sha256', $providedToken) !== $storedHash) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'external_id' => 'required|string',
            'translations' => 'required|array',
            'translations.*.locale' => 'required|string',
            'translations.*.slug' => 'required|string',
            'translations.*.title' => 'required|string',
            'translations.*.content' => 'required|string',
        ]);

        $dto = IncomingBlogPostDTO::fromRequest($request);
        $post = $action->execute($dto);

        return response()->json([
            'message' => 'Post synced successfully',
            'post_id' => $post->id,
        ]);
    }
}
