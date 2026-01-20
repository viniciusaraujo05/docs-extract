<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class ExtractionException extends RuntimeException
{
    public function __construct(
        private readonly string $translationKey,
        private readonly array $replace = [],
        string $message = '',
        int $code = 0,
        ?Throwable $previous = null
    ) {
        $realMessage = $message !== '' ? $message : $translationKey;
        parent::__construct($realMessage, $code, $previous);
    }

    public function getTranslationKey(): string
    {
        return $this->translationKey;
    }

    public function getReplace(): array
    {
        return $this->replace;
    }

    public function getTranslatedMessage(): string
    {
        return __($this->translationKey, $this->replace);
    }
}
