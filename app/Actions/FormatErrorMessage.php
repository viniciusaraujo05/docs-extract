<?php

namespace App\Actions;

/**
 * Action to format user-friendly error messages based on error type.
 */
class FormatErrorMessage
{
    /**
     * Formats an error message with suggestions based on the error.
     *
     * @param  \Throwable  $error  The original error
     * @param  bool  $isPdf  Whether the file is a PDF
     * @return array Formatted error response
     */
    public function execute(\Throwable $error, bool $isPdf = false): array
    {
        $errorMsg = strtolower($error->getMessage());

        // Determine error type
        $errorType = match (true) {
            str_contains($errorMsg, 'secured') ||
            str_contains($errorMsg, 'password') ||
            str_contains($errorMsg, 'protegido') => 'protected_pdf',

            str_contains($errorMsg, 'corrupt') ||
            str_contains($errorMsg, 'corrompido') => 'corrupt_pdf',

            default => 'processing_error'
        };

        // Format user-friendly message
        $message = match ($errorType) {
            'protected_pdf' => $isPdf
                ? 'Este PDF está protegido. O sistema tentará converter para imagem automaticamente.'
                : 'Este arquivo está protegido e não pode ser processado.',

            'corrupt_pdf' => 'O arquivo parece estar corrompido. Tente baixá-lo novamente.',

            'processing_error' => $isPdf
                ? 'Não foi possível processar este documento. O sistema tentará converter para imagem automaticamente.'
                : 'Não foi possível processar este documento. Verifique se o arquivo está completo e legível.'
        };

        // Get suggestions based on error type
        $suggestions = $this->getSuggestions($errorType, $isPdf);

        return [
            'error' => $message,
            'message' => $message,
            'error_type' => $errorType,
            'suggestions' => $suggestions,
        ];
    }

    /**
     * Gets suggestions based on error type.
     */
    private function getSuggestions(string $errorType, bool $isPdf): array
    {
        return match ($errorType) {
            'protected_pdf' => $isPdf ? [
                'Aguarde enquanto o sistema tenta converter automaticamente',
                'Se falhar, remova a proteção no Acrobat e tente novamente',
                'Ou imprima como PDF usando uma impressora virtual',
            ] : [
                'Remova a proteção do arquivo',
                'Use uma versão desprotegida do documento',
            ],

            'corrupt_pdf' => [
                'Baixe o arquivo novamente',
                'Tente obter o documento de outra fonte',
                'Verifique se o download foi completo',
            ],

            'processing_error' => $isPdf ? [
                'Aguarde enquanto o sistema tenta converter automaticamente',
                'Se falhar, converta manualmente para imagem (JPG/PNG)',
                'Use um PDF diferente se disponível',
            ] : [
                'Verifique se o arquivo não está danificado',
                'Tente usar um arquivo diferente',
                'Converta para outro formato se possível',
            ]
        };
    }
}
