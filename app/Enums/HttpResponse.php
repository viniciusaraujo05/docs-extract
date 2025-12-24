<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Enum para padronizar respostas HTTP da API.
 */
enum HttpResponse: int
{
    // 2xx Success
    case OK = 200;
    case CREATED = 201;
    case ACCEPTED = 202;
    case NO_CONTENT = 204;

    // 4xx Client Errors
    case BAD_REQUEST = 400;
    case UNAUTHORIZED = 401;
    case FORBIDDEN = 403;
    case NOT_FOUND = 404;
    case METHOD_NOT_ALLOWED = 405;
    case CONFLICT = 409;
    case UNPROCESSABLE_ENTITY = 422;
    case TOO_MANY_REQUESTS = 429;

    // 5xx Server Errors
    case INTERNAL_SERVER_ERROR = 500;
    case SERVICE_UNAVAILABLE = 503;

    /**
     * Retorna mensagem padrão para o código HTTP.
     */
    public function message(): string
    {
        return match ($this) {
            self::OK => 'Request successful.',
            self::CREATED => 'Resource created successfully.',
            self::ACCEPTED => 'Request accepted for processing.',
            self::NO_CONTENT => 'Request successful, no content to return.',
            
            self::BAD_REQUEST => 'Bad request. Please check your input.',
            self::UNAUTHORIZED => 'Unauthorized. Invalid or missing credentials.',
            self::FORBIDDEN => 'Forbidden. You do not have permission to access this resource.',
            self::NOT_FOUND => 'Resource not found.',
            self::METHOD_NOT_ALLOWED => 'Method not allowed for this endpoint.',
            self::CONFLICT => 'Conflict. Resource already exists.',
            self::UNPROCESSABLE_ENTITY => 'Validation failed. Please check your input.',
            self::TOO_MANY_REQUESTS => 'Too many requests. Please slow down.',
            
            self::INTERNAL_SERVER_ERROR => 'Internal server error. Please try again later.',
            self::SERVICE_UNAVAILABLE => 'Service temporarily unavailable.',
        };
    }

    /**
     * Retorna se o código representa sucesso (2xx).
     */
    public function isSuccess(): bool
    {
        return $this->value >= 200 && $this->value < 300;
    }

    /**
     * Retorna se o código representa erro do cliente (4xx).
     */
    public function isClientError(): bool
    {
        return $this->value >= 400 && $this->value < 500;
    }

    /**
     * Retorna se o código representa erro do servidor (5xx).
     */
    public function isServerError(): bool
    {
        return $this->value >= 500 && $this->value < 600;
    }

    /**
     * Cria resposta JSON padronizada.
     *
     * @param array<string, mixed>|null $data
     * @param array<string, mixed> $meta
     */
    public function json(
        ?array $data = null,
        ?string $message = null,
        array $meta = []
    ): array {
        $response = [
            'success' => $this->isSuccess(),
            'message' => $message ?? $this->message(),
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($meta !== []) {
            $response['meta'] = $meta;
        }

        return $response;
    }
}
