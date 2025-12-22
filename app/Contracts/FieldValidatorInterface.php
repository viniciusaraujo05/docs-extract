<?php

declare(strict_types=1);

namespace App\Contracts;

/**
 * Field Validator Interface
 *
 * Defines contract for validating extracted field values
 * against schema rules and business logic.
 *
 * Implementations should validate:
 * - Type correctness (string, number, date)
 * - Format compliance (regex, patterns)
 * - Range constraints (min, max)
 * - Business rules (e.g., date not in future)
 */
interface FieldValidatorInterface
{
    /**
     * Validate a field value against its schema definition.
     *
     * @param mixed $value The extracted value to validate
     * @param array $fieldSchema Schema definition with type, format, constraints
     * @return array{valid: bool, errors: array<string>, normalized_value: mixed}
     */
    public function validate(mixed $value, array $fieldSchema): array;

    /**
     * Normalize a field value to standard format.
     *
     * @param mixed $value The value to normalize
     * @param string $type Field type (text, number, date)
     * @return mixed Normalized value
     */
    public function normalize(mixed $value, string $type): mixed;
}
