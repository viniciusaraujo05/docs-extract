<?php

declare(strict_types=1);

namespace App\Services\Validation;

use App\Contracts\FieldValidatorInterface;

/**
 * Validator for array-type fields containing repeated structured data.
 *
 * Validates arrays of objects (e.g., invoice line items, receipt items)
 * by validating each item against the defined item schema.
 */
final readonly class ArrayFieldValidator
{
  public function __construct(
    private FieldValidatorInterface $itemValidator
  ) {
  }

  /**
   * Validate an array field value.
   *
   * @param  mixed  $value  The array value to validate
   * @param  array{name: string, type: string, label?: string, required?: bool, items?: array<array{name: string, type: string, label?: string, required?: bool}>}  $fieldSchema  Field schema definition
   * @return array{valid: bool, normalized_value: array<array<string, mixed>>, errors: array<string, mixed>}
   */
  public function validate(mixed $value, array $fieldSchema): array
  {
    // Handle null values
    if ($value === null || $value === '') {
      $isRequired = $fieldSchema['required'] ?? false;

      return [
        'valid' => !$isRequired,
        'normalized_value' => [],
        'errors' => $isRequired ? ['Field is required'] : [],
      ];
    }

    // Value must be an array
    if (!is_array($value)) {
      return [
        'valid' => false,
        'normalized_value' => [],
        'errors' => ['Value must be an array'],
      ];
    }

    $itemsSchema = $fieldSchema['items'] ?? [];

    if (empty($itemsSchema)) {
      // No schema defined for items, accept as-is
      return [
        'valid' => true,
        'normalized_value' => $value,
        'errors' => [],
      ];
    }

    $normalizedItems = [];
    $errors = [];

    foreach ($value as $index => $item) {
      if (!is_array($item)) {
        $errors["item_{$index}"] = ['Item must be an object/array'];

        continue;
      }

      $itemErrors = $this->validateItem($item, $itemsSchema);

      if (!empty($itemErrors)) {
        $errors["item_{$index}"] = $itemErrors;
      }

      $normalizedItems[] = $this->normalizeItem($item, $itemsSchema);
    }

    return [
      'valid' => empty($errors),
      'normalized_value' => $normalizedItems,
      'errors' => $errors,
    ];
  }

  /**
   * Validate a single item in the array against the items schema.
   *
   * @param  array<string, mixed>  $item  Individual item to validate
   * @param  array<array{name: string, type: string, label?: string, required?: bool}>  $itemsSchema  Schema for array items
   * @return array<string, array<string>> Validation errors by field name
   */
  private function validateItem(array $item, array $itemsSchema): array
  {
    $errors = [];

    foreach ($itemsSchema as $fieldDef) {
      $fieldName = $fieldDef['name'];
      $value = $item[$fieldName] ?? null;

      $result = $this->itemValidator->validate($value, $fieldDef);

      if (!$result['valid']) {
        $errors[$fieldName] = $result['errors'];
      }
    }

    return $errors;
  }

  /**
   * Normalize a single item in the array.
   *
   * @param  array<string, mixed>  $item  Individual item to normalize
   * @param  array<array{name: string, type: string}>  $itemsSchema  Schema for array items
   * @return array<string, mixed> Normalized item
   */
  private function normalizeItem(array $item, array $itemsSchema): array
  {
    $normalized = [];

    foreach ($itemsSchema as $fieldDef) {
      $fieldName = $fieldDef['name'];
      $value = $item[$fieldName] ?? null;

      $result = $this->itemValidator->validate($value, $fieldDef);
      $normalized[$fieldName] = $result['normalized_value'];
    }

    return $normalized;
  }
}
