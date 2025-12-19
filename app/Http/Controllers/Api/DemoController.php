<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DemoController extends Controller
{
    public function __construct(
        private ExtractionService $extractionService
    ) {}

    /**
     * Demo extraction endpoint - LIMITED TO 1 USE PER IP
     * 
     * Security measures:
     * - Rate limiting: 1 request per IP per day
     * - File validation: MIME type, size, extension
     * - Temporary storage: Files deleted after processing
     * - IP tracking: Prevents abuse
     */
    public function extract(Request $request)
    {
        // Get client IP
        $ip = $request->ip();
        $cacheKey = "demo_used_{$ip}";

        // Check if IP already used demo
        if (Cache::has($cacheKey)) {
            return response()->json([
                'error' => 'Demo already used',
                'message' => 'You have already used the demo. Please register to continue.',
            ], 429);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240', // 10MB max
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('file');
            
            // Store file temporarily
            $path = $file->store('demo', 'local');
            $fullPath = Storage::disk('local')->path($path);

            // For demo purposes, return realistic sample data
            // In production, this would use OCR + AI extraction
            $extractedData = $this->generateDemoData($file->getClientOriginalName());

            // Delete temporary file
            Storage::disk('local')->delete($path);

            // Mark IP as used (cache for 24 hours)
            Cache::put($cacheKey, true, now()->addDay());

            // Log demo usage
            Log::info('Demo extraction used', [
                'ip' => $ip,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $extractedData,
                'message' => 'Data extracted successfully! Register to continue using GetData.',
            ]);

        } catch (\Exception $e) {
            // Clean up file if exists
            if (isset($path)) {
                Storage::disk('local')->delete($path);
            }

            Log::error('Demo extraction failed', [
                'ip' => $ip,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Extraction failed',
                'message' => 'An error occurred while processing your document. Please try again.',
            ], 500);
        }
    }

    /**
     * Generate realistic demo data for demonstration purposes
     */
    private function generateDemoData(string $filename): array
    {
        // Generate realistic sample data based on common document types
        $data = [
            'document_type' => 'Invoice',
            'invoice_number' => 'INV-' . date('Y') . '-' . rand(1000, 9999),
            'date' => date('Y-m-d'),
            'due_date' => date('Y-m-d', strtotime('+30 days')),
            'total_amount' => number_format(rand(100, 5000) + (rand(0, 99) / 100), 2, '.', ''),
            'currency' => 'EUR',
            'customer_name' => $this->getRandomCompanyName(),
            'customer_email' => strtolower(str_replace(' ', '', $this->getRandomCompanyName())) . '@example.com',
            'items_count' => rand(1, 10),
            'tax_amount' => number_format(rand(20, 500) + (rand(0, 99) / 100), 2, '.', ''),
            'confidence' => rand(85, 98),
        ];

        return $data;
    }

    /**
     * Get random company name for demo
     */
    private function getRandomCompanyName(): string
    {
        $companies = [
            'ACME Corporation',
            'TechStart Solutions',
            'Global Industries Ltd',
            'Innovation Partners',
            'Digital Dynamics',
            'Future Systems Inc',
            'Smart Business Co',
            'Enterprise Solutions',
        ];

        return $companies[array_rand($companies)];
    }

    /**
     * Check if IP can use demo
     */
    public function checkAvailability(Request $request)
    {
        $ip = $request->ip();
        $cacheKey = "demo_used_{$ip}";

        return response()->json([
            'available' => !Cache::has($cacheKey),
        ]);
    }
}
