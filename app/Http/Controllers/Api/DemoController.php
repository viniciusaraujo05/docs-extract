<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DemoExtractionRequest;
use App\Models\DemoUsage;
use App\Services\Demo\DemoRateLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DemoController extends Controller
{
    public function __construct(
        private readonly DemoRateLimiter $rateLimiter,
        private readonly \App\Actions\AnalyzeDocument $analyzeDocumentAction,
        private readonly \App\Actions\Documents\ExtractFromUploadedFileAction $extractAction
    ) {}

    /**
     * Demo extraction endpoint - LIMITED TO 1 USE PER IP
     */
    public function extract(DemoExtractionRequest $request): JsonResponse
    {
        $ip = $request->ip();

        if ($this->rateLimiter->hasExceeded($ip)) {
            return response()->json([
                'error' => 'Demo limit reached',
                'message' => 'You have reached the demo limit for today. Please register to continue.',
                'retry_after_seconds' => $this->rateLimiter->secondsUntilReset($ip),
            ], 429);
        }

        $file = $request->file('file');

        // Check page count for PDFs
        if ($file->getMimeType() === 'application/pdf') {
            try {
                $config = new \Smalot\PdfParser\Config;
                $config->setRetainImageContent(false);
                $parser = new \Smalot\PdfParser\Parser([], $config);

                $previousLimit = set_time_limit(10);
                $pdf = $parser->parseFile($file->getPathname());
                set_time_limit($previousLimit);

                $pages = count($pdf->getPages());

                if ($pages > 2) {
                    Log::info('Demo page limit exceeded', ['ip' => $ip, 'pages' => $pages]);

                    return response()->json([
                        'error' => 'Page limit exceeded',
                        'message' => "Demo is limited to 2 pages maximum. We detected {$pages} pages. Please register for full access.",
                    ], 422);
                }
            } catch (\Exception $e) {
                Log::warning('Demo check: Failed to count pages', ['error' => $e->getMessage()]);
            }
        }

        try {
            // 1. Analyze document to get fields (Schema Inference)
            $analysis = $this->analyzeDocumentAction->execute($file);
            $detectedFields = $analysis['fields'];

            // 2. Extract data using the inferred fields
            // Pass null for user as this is a public demo
            $result = $this->extractAction->execute(null, $file, $detectedFields);

            if (! $result['success']) {
                throw new \Exception($result['error'] ?? 'Extraction failed');
            }

            $this->rateLimiter->increment($ip);

            // Persist demo usage for admin analytics
            DemoUsage::create([
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'success' => true,
            ]);

            Log::info('Demo extraction used', [
                'ip' => $ip,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $result['extracted_data'] ?? [],
                'message' => 'Data extracted successfully! Register to continue using DOCSET.',
            ]);

        } catch (\Exception $e) {
            // Persist failed demo usage for admin analytics
            DemoUsage::create([
                'ip_address' => $ip,
                'user_agent' => $request->userAgent(),
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'success' => false,
            ]);

            Log::error('Demo extraction failed', [
                'ip' => $ip,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Extraction failed',
                'message' => 'An error occurred while processing your document. Please try again.',
            ], 500);
        }
    }

    /**
     * Check if IP can use demo
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $ip = $request->ip();

        return response()->json([
            'available' => $this->rateLimiter->remaining($ip) > 0,
            'remaining_requests' => $this->rateLimiter->remaining($ip),
            'reset_in_seconds' => $this->rateLimiter->secondsUntilReset($ip),
        ]);
    }
}
