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
                [
                    'name' => 'line_items',
                    'type' => 'array',
                    'label' => 'Itens da Fatura',
                    'items' => [
                        ['name' => 'description', 'type' => 'string', 'label' => 'Descrição'],
                        ['name' => 'quantity', 'type' => 'number', 'label' => 'Quantidade'],
                        ['name' => 'unit_price', 'type' => 'number', 'label' => 'Preço Unitário'],
                        ['name' => 'tax_rate', 'type' => 'number', 'label' => 'Taxa IVA (%)'],
                        ['name' => 'total', 'type' => 'number', 'label' => 'Total'],
                    ],
                ],
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

    public static function getDefaultMarketReportSchema(): array
    {
        return [
            'fields' => [
                ['name' => 'period', 'type' => 'string', 'label' => 'Período Analisado'],
                ['name' => 'gross_sales', 'type' => 'number', 'label' => 'Vendas Brutas'],
                ['name' => 'units_sold', 'type' => 'number', 'label' => 'Unidades Vendidas'],
                ['name' => 'average_ticket', 'type' => 'number', 'label' => 'Ticket Médio'],
                ['name' => 'visits', 'type' => 'number', 'label' => 'Visitas'],
                ['name' => 'conversion_rate', 'type' => 'number', 'label' => 'Taxa de Conversão (%)'],
                [
                    'name' => 'top_listings',
                    'type' => 'array',
                    'label' => 'Top Anúncios',
                    'items' => [
                        ['name' => 'title', 'type' => 'string'],
                        ['name' => 'sales', 'type' => 'number'],
                        ['name' => 'visits', 'type' => 'number'],
                    ],
                ],
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
