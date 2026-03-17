<?php

declare(strict_types=1);

namespace App\Services;

use InvalidArgumentException;

class WebhookUrlGuard
{
    /**
     * Validate a webhook URL before persisting it.
     */
    public function assertCanBeStored(string $url): void
    {
        [$scheme, $host] = $this->parseUrl($url);

        if ($scheme !== 'https') {
            throw new InvalidArgumentException('Webhook URLs must use HTTPS.');
        }

        if ($this->isBlockedHostname($host)) {
            throw new InvalidArgumentException('Webhook host is not allowed.');
        }

        if (filter_var($host, FILTER_VALIDATE_IP) && ! $this->isPublicIp($host)) {
            throw new InvalidArgumentException('Webhook host must use a public IP address.');
        }
    }

    /**
     * Validate a webhook URL immediately before dispatching an outbound request.
     */
    public function assertCanBeDispatched(string $url): void
    {
        [, $host] = $this->parseUrl($url);

        $this->assertCanBeStored($url);

        foreach ($this->resolveHostIps($host) as $ip) {
            if (! $this->isPublicIp($ip)) {
                throw new InvalidArgumentException('Webhook host resolved to a non-public IP.');
            }
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function parseUrl(string $url): array
    {
        $parts = parse_url($url);

        if (! is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            throw new InvalidArgumentException('Invalid webhook URL.');
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            throw new InvalidArgumentException('Webhook URLs must not include credentials.');
        }

        return [strtolower((string) $parts['scheme']), strtolower((string) $parts['host'])];
    }

    private function isBlockedHostname(string $host): bool
    {
        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            return true;
        }

        return str_ends_with($host, '.localhost')
            || str_ends_with($host, '.local')
            || str_ends_with($host, '.internal');
    }

    private function isPublicIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) !== false;
    }

    /**
     * @return list<string>
     */
    private function resolveHostIps(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        if (
            app()->environment('testing')
            && in_array($host, ['example.com', 'example.org', 'example.net'], true)
        ) {
            return ['93.184.216.34'];
        }

        $ips = [];
        $records = @dns_get_record($host, DNS_A + DNS_AAAA);

        if (is_array($records)) {
            foreach ($records as $record) {
                if (isset($record['ip']) && is_string($record['ip'])) {
                    $ips[] = $record['ip'];
                }

                if (isset($record['ipv6']) && is_string($record['ipv6'])) {
                    $ips[] = $record['ipv6'];
                }
            }
        }

        if ($ips === []) {
            $fallbackIps = @gethostbynamel($host);

            if (is_array($fallbackIps)) {
                $ips = $fallbackIps;
            }
        }

        $ips = array_values(array_unique(array_filter($ips, 'is_string')));

        if ($ips === []) {
            throw new InvalidArgumentException('Webhook host could not be resolved.');
        }

        return $ips;
    }
}
