<?php

declare(strict_types=1);

namespace App\Services\Validation;

use App\Contracts\FieldValidatorInterface;
use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;

/**
 * Field Validator Service
 *
 * Validates and normalizes extracted field values according to
 * schema definitions and business rules.
 *
 * Supports:
 * - Type validation (text, number, date)
 * - Format validation (regex patterns)
 * - Range constraints (min, max)
 * - Required field checks
 */
final class FieldValidator implements FieldValidatorInterface
{
    private const CONFIDENCE_THRESHOLD = 70;

    /**
     * {@inheritDoc}
     */
    public function validate(mixed $value, array $fieldSchema): array
    {
        $errors = [];
        $type = $fieldSchema['type'] ?? 'text';
        $required = $fieldSchema['required'] ?? false;

        // Check required
        if ($required && ($value === null || $value === '')) {
            $errors[] = 'Field is required but empty';

            return [
                'valid' => false,
                'errors' => $errors,
                'normalized_value' => null,
            ];
        }

        // Skip validation if empty and not required
        if ($value === null || $value === '') {
            return [
                'valid' => true,
                'errors' => [],
                'normalized_value' => null,
            ];
        }

        // Normalize value
        try {
            $normalizedValue = $this->normalize($value, $type);
        } catch (\Exception $e) {
            $errors[] = "Normalization failed: {$e->getMessage()}";

            return [
                'valid' => false,
                'errors' => $errors,
                'normalized_value' => $value,
            ];
        }

        // Type-specific validation
        $typeErrors = match ($type) {
            'number' => $this->validateNumber($normalizedValue, $fieldSchema),
            'date' => $this->validateDate($normalizedValue, $fieldSchema),
            'text' => $this->validateText($normalizedValue, $fieldSchema),
            default => [],
        };

        $errors = array_merge($errors, $typeErrors);

        // Pattern validation
        if (isset($fieldSchema['pattern']) && is_string($normalizedValue)) {
            if (! preg_match($fieldSchema['pattern'], $normalizedValue)) {
                $errors[] = 'Value does not match required pattern';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'normalized_value' => $normalizedValue,
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function normalize(mixed $value, string $type): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        return match ($type) {
            'number' => $this->normalizeNumber($value),
            'date' => $this->normalizeDate($value),
            'text' => $this->normalizeText($value),
            default => $value,
        };
    }

    /**
     * Validate number field.
     *
     * @param  mixed  $value  Normalized value
     * @param  array  $schema  Field schema
     * @return array<string> Validation errors
     */
    private function validateNumber(mixed $value, array $schema): array
    {
        $errors = [];

        if (! is_numeric($value)) {
            $errors[] = 'Value is not a valid number';

            return $errors;
        }

        $numValue = (float) $value;

        if (isset($schema['min']) && $numValue < $schema['min']) {
            $errors[] = "Value {$numValue} is below minimum {$schema['min']}";
        }

        if (isset($schema['max']) && $numValue > $schema['max']) {
            $errors[] = "Value {$numValue} exceeds maximum {$schema['max']}";
        }

        if (isset($schema['positive']) && $schema['positive'] && $numValue < 0) {
            $errors[] = 'Value must be positive';
        }

        return $errors;
    }

    /**
     * Validate date field.
     *
     * @param  mixed  $value  Normalized value
     * @param  array  $schema  Field schema
     * @return array<string> Validation errors
     */
    private function validateDate(mixed $value, array $schema): array
    {
        $errors = [];

        if (! $value instanceof Carbon) {
            $errors[] = 'Value is not a valid date';

            return $errors;
        }

        if (isset($schema['not_future']) && $schema['not_future'] && $value->isFuture()) {
            $errors[] = 'Date cannot be in the future';
        }

        if (isset($schema['not_past']) && $schema['not_past'] && $value->isPast()) {
            $errors[] = 'Date cannot be in the past';
        }

        if (isset($schema['min_date'])) {
            $minDate = Carbon::parse($schema['min_date']);
            if ($value->isBefore($minDate)) {
                $errors[] = "Date is before minimum {$minDate->toDateString()}";
            }
        }

        if (isset($schema['max_date'])) {
            $maxDate = Carbon::parse($schema['max_date']);
            if ($value->isAfter($maxDate)) {
                $errors[] = "Date is after maximum {$maxDate->toDateString()}";
            }
        }

        return $errors;
    }

    /**
     * Validate text field.
     *
     * @param  mixed  $value  Normalized value
     * @param  array  $schema  Field schema
     * @return array<string> Validation errors
     */
    private function validateText(mixed $value, array $schema): array
    {
        $errors = [];

        if (! is_string($value)) {
            $errors[] = 'Value is not a valid text';

            return $errors;
        }

        if (isset($schema['min_length']) && mb_strlen($value) < $schema['min_length']) {
            $errors[] = "Text is shorter than minimum length {$schema['min_length']}";
        }

        if (isset($schema['max_length']) && mb_strlen($value) > $schema['max_length']) {
            $errors[] = "Text exceeds maximum length {$schema['max_length']}";
        }

        return $errors;
    }

    /**
     * Normalize number value.
     *
     * Removes currency symbols, thousands separators, and converts to float.
     */
    private function normalizeNumber(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        $stringValue = (string) $value;

        // Remove common currency symbols and whitespace
        $cleaned = preg_replace('/[€$£¥\s]/u', '', $stringValue);

        // Replace comma with dot for decimal separator
        $cleaned = str_replace(',', '.', $cleaned);

        // Remove any remaining non-numeric characters except dot and minus
        $cleaned = preg_replace('/[^\d.-]/', '', $cleaned);

        if ($cleaned === '' || $cleaned === null) {
            return null;
        }

        return (float) $cleaned;
    }

    /**
     * Normalize date value.
     *
     * Attempts to parse various date formats into Carbon instance.
     */
    private function normalizeDate(mixed $value): ?Carbon
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value;
        }

        try {
            // Try standard formats first
            return Carbon::parse($value);
        } catch (InvalidFormatException $e) {
            // Try common European formats
            $formats = [
                'd/m/Y',
                'd-m-Y',
                'd.m.Y',
                'Y-m-d',
                'd/m/y',
                'd-m-y',
            ];

            foreach ($formats as $format) {
                try {
                    return Carbon::createFromFormat($format, (string) $value);
                } catch (InvalidFormatException $e) {
                    continue;
                }
            }

            throw new \InvalidArgumentException("Unable to parse date: {$value}");
        }
    }

    /**
     * Normalize text value.
     *
     * Trims whitespace and normalizes line breaks.
     */
    private function normalizeText(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $text = (string) $value;

        // Normalize line breaks
        $text = str_replace(["\r\n", "\r"], "\n", $text);

        // Trim whitespace
        $text = trim($text);

        return $text !== '' ? $text : null;
    }

    /**
     * Check if a field has low confidence.
     *
     * @param  int|null  $confidence  Confidence score (0-100)
     * @return bool True if confidence is below threshold
     */
    public function hasLowConfidence(?int $confidence): bool
    {
        return $confidence !== null && $confidence < self::CONFIDENCE_THRESHOLD;
    }
}
