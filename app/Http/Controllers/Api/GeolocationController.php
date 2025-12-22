<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Controller para proxy de geolocalização.
 * 
 * Resolve problemas de CORS fazendo a requisição server-side
 * e cacheando resultados para melhor performance.
 */
final class GeolocationController extends Controller
{
    private const CACHE_TTL = 3600; // 1 hora
    private const API_TIMEOUT = 10;

    /**
     * Detecta a localização do usuário baseado no IP.
     */
    public function detect(): JsonResponse
    {
        $ip = request()->ip();
        
        // IPs locais/privados retornam fallback
        if ($this->isPrivateIp($ip)) {
            return response()->json([
                'countryCode' => 'PT',
                'countryName' => 'Portugal',
                'cityName' => 'Unknown',
                'isLocal' => true,
            ]);
        }

        // Tenta buscar do cache
        $cacheKey = "geolocation:{$ip}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            Log::debug('Geolocation cache hit', ['ip' => $ip]);
            return response()->json($cached);
        }

        // Faz requisição para API externa
        try {
            $response = Http::timeout(self::API_TIMEOUT)
                ->get('https://freeipapi.com/api/json/' . $ip);

            if (!$response->successful()) {
                throw new \RuntimeException('API request failed');
            }

            $data = $response->json();

            // Valida dados essenciais
            if (!isset($data['countryCode'])) {
                throw new \RuntimeException('Invalid API response');
            }

            // Normaliza resposta
            $normalized = [
                'countryCode' => strtoupper($data['countryCode'] ?? 'PT'),
                'countryName' => $data['countryName'] ?? 'Unknown',
                'cityName' => $data['cityName'] ?? 'Unknown',
                'continent' => $data['continent'] ?? 'Europe',
                'languages' => $data['languages'] ?? [],
            ];

            // Cacheia resultado
            Cache::put($cacheKey, $normalized, self::CACHE_TTL);

            Log::info('Geolocation detected', [
                'ip' => $ip,
                'country' => $normalized['countryCode'],
            ]);

            return response()->json($normalized);

        } catch (\Throwable $e) {
            Log::warning('Geolocation detection failed', [
                'ip' => $ip,
                'error' => $e->getMessage(),
            ]);

            // Fallback para Portugal
            $fallback = [
                'countryCode' => 'PT',
                'countryName' => 'Portugal',
                'cityName' => 'Unknown',
                'continent' => 'Europe',
                'languages' => ['pt'],
                'fallback' => true,
            ];

            return response()->json($fallback);
        }
    }

    /**
     * Verifica se o IP é privado/local.
     */
    private function isPrivateIp(string $ip): bool
    {
        // IPs locais
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return true;
        }

        // Ranges privados
        $privateRanges = [
            '10.0.0.0|10.255.255.255',
            '172.16.0.0|172.31.255.255',
            '192.168.0.0|192.168.255.255',
        ];

        $longIp = ip2long($ip);
        if ($longIp === false) {
            return true; // IPv6 ou inválido
        }

        foreach ($privateRanges as $range) {
            [$start, $end] = explode('|', $range);
            if ($longIp >= ip2long($start) && $longIp <= ip2long($end)) {
                return true;
            }
        }

        return false;
    }
}
