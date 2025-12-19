<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExtractionSchema extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'name',
        'document_type',
        'fields',
        'is_default',
        'is_system',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getDefaultInvoiceSchema(): array
    {
        return [
            'fields' => [
                ['name' => 'supplier_name', 'type' => 'string', 'label' => 'Fornecedor'],
                ['name' => 'supplier_vat', 'type' => 'string', 'label' => 'NIF Fornecedor'],
                ['name' => 'invoice_number', 'type' => 'string', 'label' => 'Número da Fatura'],
                ['name' => 'invoice_date', 'type' => 'date', 'label' => 'Data'],
                ['name' => 'due_date', 'type' => 'date', 'label' => 'Data de Vencimento'],
                ['name' => 'subtotal', 'type' => 'number', 'label' => 'Subtotal'],
                ['name' => 'vat_amount', 'type' => 'number', 'label' => 'IVA'],
                ['name' => 'vat_rate', 'type' => 'number', 'label' => 'Taxa IVA (%)'],
                ['name' => 'total', 'type' => 'number', 'label' => 'Total'],
                ['name' => 'currency', 'type' => 'string', 'label' => 'Moeda'],
            ],
        ];
    }

    public static function getDefaultReceiptSchema(): array
    {
        return [
            'fields' => [
                ['name' => 'merchant_name', 'type' => 'string', 'label' => 'Estabelecimento'],
                ['name' => 'date', 'type' => 'date', 'label' => 'Data'],
                ['name' => 'total', 'type' => 'number', 'label' => 'Total'],
                ['name' => 'payment_method', 'type' => 'string', 'label' => 'Método de Pagamento'],
                ['name' => 'vat_amount', 'type' => 'number', 'label' => 'IVA'],
            ],
        ];
    }

    protected function casts(): array
    {
        return [
            'fields' => 'array',
            'is_default' => 'boolean',
            'is_system' => 'boolean',
        ];
    }
}
