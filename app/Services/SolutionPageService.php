<?php

namespace App\Services;

class SolutionPageService
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        return [
            'invoice-ocr' => [
                'slug' => 'invoice-ocr',
                'title' => 'Invoice OCR Software for AP Teams and ERP Export | DOCSET',
                'description' => 'Invoice OCR software to extract totals, VAT, line items, and due dates from PDFs into JSON or Excel. Reduce AP data entry and speed invoice approvals.',
                'h1' => 'Invoice OCR for Accounts Payable Teams',
                'intro' => [
                    'Invoice OCR in Docset is built for teams that receive supplier invoices in different templates and need clean data in spreadsheets, ERP systems, or approval workflows. Instead of manually typing each field, you upload the file, define the fields you care about, and review extracted values before export.',
                    'The goal is simple: reduce repetitive data entry while keeping your controls in place. You can validate invoice numbers, compare tax totals, and check due dates in one review screen. When data looks right, export to Excel, sync the same columns to Google Sheets, or consume structured JSON in your own flow.',
                ],
                'whatIs' => [
                    'Invoice OCR is a process that reads invoice PDFs and images, recognizes text, and maps the content into structured fields. In practice, that means turning vendor documents into records your finance team can search, reconcile, and approve.',
                    'Docset combines OCR with configurable extraction logic. You can define the schema for invoice header data, taxes, and line items, then reuse that schema across recurring uploads. This works for multi-page PDFs, scanned invoices, and mixed layouts where fields move around.',
                    'Because every supplier formats invoices differently, extraction quality depends on clear field definitions and review rules. Docset is designed for this operational reality: high-volume processing with human validation where needed.',
                ],
                'extractFields' => [
                    ['field' => 'Vendor name', 'example' => 'Northwind Components Ltd'],
                    ['field' => 'Vendor tax ID', 'example' => 'GB123456789'],
                    ['field' => 'Invoice number', 'example' => 'INV-2026-00418'],
                    ['field' => 'Invoice date', 'example' => '2026-02-12'],
                    ['field' => 'Due date', 'example' => '2026-03-14'],
                    ['field' => 'Currency', 'example' => 'USD or EUR'],
                    ['field' => 'Subtotal', 'example' => '12450.00'],
                    ['field' => 'VAT / tax amount', 'example' => '2490.00'],
                    ['field' => 'Grand total', 'example' => '14940.00'],
                    ['field' => 'Purchase order reference', 'example' => 'PO-88217'],
                    ['field' => 'Payment terms', 'example' => 'Net 30'],
                    ['field' => 'Line items', 'example' => 'Description, qty, unit price, line total'],
                ],
                'steps' => [
                    [
                        'title' => 'Upload invoices',
                        'description' => 'Upload one file or a batch from your desktop, or import invoice PDFs from Google Drive after connecting your account.',
                    ],
                    [
                        'title' => 'Apply your invoice schema',
                        'description' => 'Use a saved template with required invoice fields, line-item arrays, and data types like date, number, and text.',
                    ],
                    [
                        'title' => 'Review extracted data',
                        'description' => 'Check totals, dates, tax fields, and line items in a structured interface before approving the final output.',
                    ],
                    [
                        'title' => 'Export or integrate',
                        'description' => 'Download clean Excel files, push mapped rows to Google Sheets for live collaboration, or consume JSON in ERP and AP APIs.',
                    ],
                ],
                'useCases' => [
                    'Accounts payable teams standardizing invoices from many suppliers.',
                    'Shared service centers reducing manual booking time.',
                    'Finance operations preparing weekly payable exports for ERP import.',
                    'Operations teams maintaining live AP trackers in Google Sheets.',
                    'Audit preparation with consistent invoice fields and history.',
                    'PO matching workflows that require invoice number, vendor, and totals.',
                    'Back-office teams handling seasonal invoice spikes without extra headcount.',
                ],
                'example' => [
                    'json' => [
                        'invoice_number' => 'INV-2026-00418',
                        'vendor' => 'Northwind Components Ltd',
                        'invoice_date' => '2026-02-12',
                        'due_date' => '2026-03-14',
                        'currency' => 'USD',
                        'subtotal' => 12450.00,
                        'tax' => 2490.00,
                        'total' => 14940.00,
                        'line_items' => [
                            [
                                'description' => 'Industrial filter cartridge',
                                'qty' => 120,
                                'unit_price' => 85.00,
                                'line_total' => 10200.00,
                            ],
                        ],
                    ],
                    'excelMapping' => [
                        'Column A: invoice_number',
                        'Column B: vendor',
                        'Column C: invoice_date',
                        'Column D: due_date',
                        'Column E: subtotal',
                        'Column F: tax',
                        'Column G: total',
                    ],
                    'note' => 'Line items can be exported to a second tab in Excel or Google Sheets, so header values stay clean while preserving item-level detail for reconciliation.',
                ],
                'security' => [
                    'Documents are processed only to provide extraction and review workflows.',
                    'Data is encrypted in transit (TLS) and at rest.',
                    'You can control retention and delete uploaded files when your workflow is complete.',
                    'Access is account-based, and API usage can be managed with scoped credentials.',
                ],
                'faqs' => [
                    [
                        'q' => 'Can it handle different invoice layouts?',
                        'a' => 'Yes. The extraction template is field-based, so you can process invoices from multiple vendors without creating a separate workflow for every minor layout change.',
                    ],
                    [
                        'q' => 'Does invoice OCR extract line items?',
                        'a' => 'Yes. You can define line-item arrays with description, quantity, unit price, tax, and line total, then export them for downstream checks.',
                    ],
                    [
                        'q' => 'Can I export invoice data to Excel or Google Sheets?',
                        'a' => 'Yes. You can export structured invoice fields to Excel and also send the same mapped columns to Google Sheets when teams need collaborative review.',
                    ],
                    [
                        'q' => 'Can I import invoices from Google Drive?',
                        'a' => 'Yes. After connecting Google in integrations, you can pull invoice files from Drive and run the same extraction template used for local uploads.',
                    ],
                    [
                        'q' => 'Is this suitable for AP approval workflows?',
                        'a' => 'It is. Teams typically extract header fields and totals first, validate key values, and then pass approved records into approval or ERP flows.',
                    ],
                    [
                        'q' => 'Do I need developers to use it?',
                        'a' => 'No. Non-technical teams can upload files, apply templates, review results, and export data without writing code. API integration is optional.',
                    ],
                    [
                        'q' => 'How accurate is invoice OCR?',
                        'a' => 'Accuracy depends on scan quality, document complexity, and schema setup. Most teams pair automation with quick validation rules for reliable operations.',
                    ],
                ],
            ],
            'receipt-ocr' => [
                'slug' => 'receipt-ocr',
                'title' => 'Receipt OCR Software for Expense Teams and Audits | DOCSET',
                'description' => 'Receipt OCR software for extracting merchant, amount, tax, and date fields from receipts. Export clean data to Excel or JSON for expense workflows today.',
                'h1' => 'Receipt OCR for Faster Expense Processing',
                'intro' => [
                    'Receipt OCR helps finance teams process employee expenses without manually copying totals from photos and PDFs. With Docset, you can standardize what gets extracted from each receipt and keep the output in a format your accounting process can use immediately.',
                    'The page is focused on operational work: capture receipt values, validate tax and total amounts, and export data for reimbursements or bookkeeping in Excel, Google Sheets, or JSON. This reduces the manual cleanup that usually happens before month-end close.',
                ],
                'whatIs' => [
                    'Receipt OCR converts unstructured receipt images and PDFs into usable records. Instead of storing receipts as files only, you can store searchable fields like merchant, transaction date, and total amount.',
                    'Docset lets you define consistent receipt schemas so every uploaded file returns the same set of fields. That consistency matters for expense policy checks, reconciliation, and audit readiness.',
                    'If your team handles mixed receipt quality, review mode gives a controlled way to confirm key values before data is exported or sent through API workflows.',
                ],
                'extractFields' => [
                    ['field' => 'Merchant name', 'example' => 'City Office Supplies'],
                    ['field' => 'Merchant address', 'example' => '315 Market St, Denver CO'],
                    ['field' => 'Receipt number', 'example' => 'R-882914'],
                    ['field' => 'Transaction date', 'example' => '2026-02-19'],
                    ['field' => 'Transaction time', 'example' => '14:37'],
                    ['field' => 'Payment method', 'example' => 'Corporate card'],
                    ['field' => 'Subtotal', 'example' => '48.90'],
                    ['field' => 'Tax amount', 'example' => '4.16'],
                    ['field' => 'Total amount', 'example' => '53.06'],
                    ['field' => 'Currency', 'example' => 'USD'],
                    ['field' => 'Expense category hints', 'example' => 'Meals, Transport, Office supplies'],
                ],
                'steps' => [
                    [
                        'title' => 'Collect receipt files',
                        'description' => 'Upload phone photos, scanned receipts, or import files from Google Drive when receipts are already centralized there.',
                    ],
                    [
                        'title' => 'Run the receipt template',
                        'description' => 'Apply your pre-defined fields for merchant data, dates, tax, totals, and policy-critical attributes.',
                    ],
                    [
                        'title' => 'Validate exception fields',
                        'description' => 'Check low-confidence totals, unusual tax values, or missing merchant identifiers before final export.',
                    ],
                    [
                        'title' => 'Export to your expense process',
                        'description' => 'Send clean records to Excel, Google Sheets, or JSON endpoints for reimbursement and accounting workflows.',
                    ],
                ],
                'useCases' => [
                    'Expense management teams processing weekly employee reimbursements.',
                    'Bookkeeping teams consolidating receipts by department or cost center.',
                    'Month-end close workflows that need fast receipt reconciliation.',
                    'Audit support where each expense needs traceable source data.',
                    'Travel and field operations with high receipt volume from mobile captures.',
                    'SMB finance teams replacing manual receipt entry in spreadsheets.',
                    'Managers reviewing team expenses in shared Google Sheets tabs.',
                ],
                'example' => [
                    'json' => [
                        'merchant' => 'City Office Supplies',
                        'date' => '2026-02-19',
                        'currency' => 'USD',
                        'subtotal' => 48.90,
                        'tax' => 4.16,
                        'total' => 53.06,
                        'payment_method' => 'Corporate card',
                        'receipt_number' => 'R-882914',
                    ],
                    'excelMapping' => [
                        'Column A: date',
                        'Column B: merchant',
                        'Column C: receipt_number',
                        'Column D: subtotal',
                        'Column E: tax',
                        'Column F: total',
                        'Column G: payment_method',
                    ],
                    'note' => 'A single worksheet is usually enough for receipts, and the same column mapping works in both Excel and Google Sheets.',
                ],
                'security' => [
                    'Receipts are processed for extraction workflows only.',
                    'Transport and storage use encryption by default.',
                    'Teams can control access and remove files after processing.',
                    'Structured output can be reviewed before it is shared downstream.',
                ],
                'faqs' => [
                    [
                        'q' => 'Will it work with photos from mobile phones?',
                        'a' => 'Yes. Receipt OCR works with common image formats captured on mobile devices, as well as scanned PDFs from email or expense tools.',
                    ],
                    [
                        'q' => 'Can I capture taxes separately from totals?',
                        'a' => 'Yes. Tax and total values can be extracted as separate numeric fields, which helps with reconciliation and policy checks.',
                    ],
                    [
                        'q' => 'How does it help during audits?',
                        'a' => 'You get consistent, searchable fields tied to each receipt file, which makes it faster to produce supporting records when auditors request evidence.',
                    ],
                    [
                        'q' => 'Can receipt OCR handle different currencies?',
                        'a' => 'Yes. Currency can be extracted explicitly, allowing teams to separate local and foreign expenses before conversion or posting.',
                    ],
                    [
                        'q' => 'Do I need to train a model?',
                        'a' => 'No custom model training is required to start. Most teams configure a schema and iterate with review rules as their volume grows.',
                    ],
                    [
                        'q' => 'Can I use API instead of spreadsheet exports?',
                        'a' => 'Yes. You can consume structured JSON through API workflows, while still exporting to Excel or Google Sheets for finance review.',
                    ],
                    [
                        'q' => 'Can receipts come directly from Google Drive?',
                        'a' => 'Yes. Connect your Google account, select receipts from Drive, and process them with the same schema used for uploaded images and PDFs.',
                    ],
                ],
            ],
            'pdf-to-excel' => [
                'slug' => 'pdf-to-excel',
                'title' => 'PDF to Excel Converter for Finance Ops and Reports | DOCSET',
                'description' => 'PDF to Excel converter that turns invoices, receipts, and forms into structured sheets with mapped columns. Export faster with less manual cleanup today.',
                'h1' => 'PDF to Excel Conversion for Operational Data',
                'intro' => [
                    'Teams often receive critical data in PDFs that are hard to reuse: vendor invoices, receipts, statements, and custom forms. A PDF to Excel converter should do more than copy visible text. It should return consistent columns that operations teams can trust.',
                    'Docset is designed for this practical use case. You define fields once, process incoming PDFs from desktop or Google Drive, review extracted values, and export structured outputs to Excel, Google Sheets, or JSON workflows.',
                ],
                'whatIs' => [
                    'PDF to Excel conversion in Docset means mapping document content into typed fields, not just dumping text into cells. This creates cleaner spreadsheets and less manual fixing later.',
                    'The workflow supports recurring documents where format changes slightly over time. Instead of rebuilding formulas each week, you keep a stable extraction template and generate standardized outputs.',
                    'Because teams still need control, review mode lets you validate key cells like totals, dates, and identifiers before sharing files with accounting, ops, or BI stakeholders.',
                ],
                'extractFields' => [
                    ['field' => 'Document ID', 'example' => 'INV-2026-8841'],
                    ['field' => 'Entity name', 'example' => 'Acme Manufacturing'],
                    ['field' => 'Issue date', 'example' => '2026-02-21'],
                    ['field' => 'Due date', 'example' => '2026-03-23'],
                    ['field' => 'Reference numbers', 'example' => 'PO, order ID, account ID'],
                    ['field' => 'Currency and locale', 'example' => 'USD en-US'],
                    ['field' => 'Net amount', 'example' => '8460.00'],
                    ['field' => 'Tax amount', 'example' => '1692.00'],
                    ['field' => 'Total amount', 'example' => '10152.00'],
                    ['field' => 'Array rows', 'example' => 'Items, quantities, unit prices'],
                    ['field' => 'Custom tags', 'example' => 'Cost center, project code'],
                ],
                'steps' => [
                    [
                        'title' => 'Choose a conversion template',
                        'description' => 'Select or create a field schema with the exact columns your spreadsheet consumers expect.',
                    ],
                    [
                        'title' => 'Upload PDF files',
                        'description' => 'Process one file for ad-hoc conversion, run batches, or pull PDFs from Google Drive for recurring weekly volumes.',
                    ],
                    [
                        'title' => 'Review mapped values',
                        'description' => 'Check critical values and make quick fixes before export, especially for totals and key identifiers.',
                    ],
                    [
                        'title' => 'Export to Excel or Google Sheets',
                        'description' => 'Download clean spreadsheets with stable columns or sync to Google Sheets while keeping JSON available for API-driven workflows.',
                    ],
                ],
                'useCases' => [
                    'Converting monthly supplier PDF invoices into a standardized AP workbook.',
                    'Preparing expense receipt exports for reimbursement and bookkeeping.',
                    'Transforming PDF forms into analyzable Excel tables for operations teams.',
                    'Sharing standardized outputs in Google Sheets for cross-team tracking.',
                    'Consolidating mixed PDF data into one reporting model with fixed columns.',
                    'Reducing spreadsheet cleanup time for finance analysts before close.',
                    'Generating structured files that can be imported into ERP templates.',
                ],
                'example' => [
                    'json' => [
                        'document_id' => 'INV-2026-8841',
                        'entity' => 'Acme Manufacturing',
                        'issue_date' => '2026-02-21',
                        'due_date' => '2026-03-23',
                        'net' => 8460.00,
                        'tax' => 1692.00,
                        'total' => 10152.00,
                        'project_code' => 'PRJ-47',
                    ],
                    'excelMapping' => [
                        'Column A: document_id',
                        'Column B: entity',
                        'Column C: issue_date',
                        'Column D: due_date',
                        'Column E: net',
                        'Column F: tax',
                        'Column G: total',
                        'Column H: project_code',
                    ],
                    'note' => 'You can keep one worksheet for header data and a second worksheet for repeating rows like line items, in either Excel or Google Sheets.',
                ],
                'security' => [
                    'Uploaded PDFs are handled for extraction workflows only.',
                    'Encryption is applied during transfer and storage.',
                    'User-level access controls keep exported data scoped to your workspace.',
                    'You can remove files and outputs when your retention policy requires it.',
                ],
                'faqs' => [
                    [
                        'q' => 'Is this a simple copy-paste converter?',
                        'a' => 'No. The goal is structured conversion with consistent fields, so your Excel output is usable for operations, analysis, and imports.',
                    ],
                    [
                        'q' => 'Can I keep the same Excel column order every time?',
                        'a' => 'Yes. Templates let you define predictable field names and column ordering for recurring document types.',
                    ],
                    [
                        'q' => 'Can I convert multi-page PDFs?',
                        'a' => 'Yes. Multi-page PDFs can be processed and mapped into one structured record or expanded outputs based on your schema.',
                    ],
                    [
                        'q' => 'Does it work for forms, invoices, and receipts?',
                        'a' => 'Yes. Any PDF with extractable business data can be mapped to your target fields and exported to Excel.',
                    ],
                    [
                        'q' => 'Can analysts review data before export?',
                        'a' => 'Yes. Review mode is part of the flow so teams can validate totals, dates, and IDs before files are shared.',
                    ],
                    [
                        'q' => 'Do you provide API output too?',
                        'a' => 'Yes. The same extraction can be consumed as JSON when you want to automate downstream systems beyond spreadsheets.',
                    ],
                    [
                        'q' => 'Can I import from Google Drive and export to Google Sheets?',
                        'a' => 'Yes. After connecting Google integrations, you can pick PDFs from Drive and send mapped results to Sheets without rebuilding the template.',
                    ],
                ],
            ],
            'ocr-api' => [
                'slug' => 'ocr-api',
                'title' => 'OCR API for Invoice and Receipt Data Extraction | DOCSET',
                'description' => 'OCR API for extracting structured fields from invoices, receipts, and PDFs. Send files, receive JSON, and automate document workflows with less manual work.',
                'h1' => 'OCR API for Document Data Extraction',
                'intro' => [
                    'The OCR API in Docset is built for teams that need programmatic document extraction in existing systems. Instead of routing files through manual review first, you can upload documents through API endpoints and receive structured JSON in return.',
                    'This is useful when invoices, receipts, and forms arrive from multiple sources, including Google Drive-connected workflows, and must be normalized quickly for finance, operations, or reporting pipelines.',
                ],
                'whatIs' => [
                    'An OCR API accepts document input and returns machine-readable fields. The value is in consistency: your applications receive a predictable data structure regardless of document layout differences.',
                    'Docset provides API access to extraction workflows that can also be used in the UI. Teams can prototype with the interface, then move high-volume processing to API calls once field definitions are stable.',
                    'For engineering teams, this reduces the complexity of building and maintaining custom OCR pipelines in-house while preserving control over schemas and output contracts.',
                ],
                'extractFields' => [
                    ['field' => 'Document identifiers', 'example' => 'invoice_number, receipt_number'],
                    ['field' => 'Party information', 'example' => 'vendor, customer, tax IDs'],
                    ['field' => 'Date fields', 'example' => 'issue_date, due_date, transaction_date'],
                    ['field' => 'Financial totals', 'example' => 'subtotal, tax, total, currency'],
                    ['field' => 'Line-item arrays', 'example' => 'description, qty, amount'],
                    ['field' => 'Reference fields', 'example' => 'PO number, account code'],
                    ['field' => 'Custom business fields', 'example' => 'cost center, approval code'],
                ],
                'steps' => [
                    [
                        'title' => 'Authenticate API requests',
                        'description' => 'Create and manage API credentials in your account, then authorize requests from backend services.',
                    ],
                    [
                        'title' => 'Upload or submit document files',
                        'description' => 'Send PDFs or images through the upload endpoint and associate each file with the extraction schema you need. Teams also mirror the same schemas for Google Drive-driven UI intake.',
                    ],
                    [
                        'title' => 'Poll status or receive completion',
                        'description' => 'Track processing state and retrieve structured output when extraction is complete for each document.',
                    ],
                    [
                        'title' => 'Store JSON and feed spreadsheet workflows',
                        'description' => 'Map API responses into ERP, accounting, or analytics pipelines, and publish selected fields to Excel or Google Sheets for non-technical teams.',
                    ],
                ],
                'useCases' => [
                    'Automating invoice ingestion in AP platforms.',
                    'Building receipt ingestion endpoints in expense products.',
                    'Normalizing vendor documents before ERP import jobs.',
                    'Feeding extracted fields into approval and fraud checks.',
                    'Powering internal tools that need searchable document data.',
                    'Supporting partner integrations that require structured payloads.',
                    'Providing Google Sheets views of API data for finance and operations follow-up.',
                ],
                'example' => [
                    'json' => [
                        'document_id' => 'doc_9f2a1',
                        'status' => 'completed',
                        'data' => [
                            'invoice_number' => 'INV-2026-00418',
                            'vendor' => 'Northwind Components Ltd',
                            'currency' => 'USD',
                            'total' => 14940.00,
                        ],
                    ],
                    'excelMapping' => [
                        'API field data.invoice_number -> Excel column A',
                        'API field data.vendor -> Excel column B',
                        'API field data.total -> Excel column C',
                    ],
                    'note' => 'Many teams use JSON directly in services and publish the same mapped fields to Excel or Google Sheets for finance review and audit exports.',
                ],
                'security' => [
                    'API requests are authenticated and can be scoped per client.',
                    'Transport uses HTTPS and sensitive data is encrypted at rest.',
                    'You can rotate credentials and disable clients when needed.',
                    'Data access stays tied to your workspace and permission model.',
                ],
                'faqs' => [
                    [
                        'q' => 'Can I use the OCR API without using the UI?',
                        'a' => 'Yes. API-only workflows are supported. Many teams still use the UI during setup to validate schemas before full automation.',
                    ],
                    [
                        'q' => 'What output format do I get?',
                        'a' => 'Responses are returned as structured JSON with your configured fields, including arrays when line items are defined.',
                    ],
                    [
                        'q' => 'How do I handle asynchronous processing?',
                        'a' => 'Submit the file, track status, and fetch the result once processing is complete. This pattern scales well for batch ingestion.',
                    ],
                    [
                        'q' => 'Can I define custom fields for my workflow?',
                        'a' => 'Yes. Custom schemas are a core part of the platform, so your API responses match your business requirements.',
                    ],
                    [
                        'q' => 'Is rate control available?',
                        'a' => 'API usage limits and plan constraints are enforced to keep processing predictable across accounts and workloads.',
                    ],
                    [
                        'q' => 'Can I combine API extraction with Excel or Google Sheets exports?',
                        'a' => 'Yes. Teams often automate JSON ingestion and still publish spreadsheet outputs for operational review, reporting, and exception handling.',
                    ],
                    [
                        'q' => 'Can documents come from Google Drive in this workflow?',
                        'a' => 'Yes. Many teams use Drive in the UI flow to collect files, then process with the same extraction schemas and API contracts.',
                    ],
                ],
            ],
            'invoice-parser' => [
                'slug' => 'invoice-parser',
                'title' => 'Invoice Parser API for Line Items, Tax, and Totals | DOCSET',
                'description' => 'Invoice parser API that captures invoice headers, taxes, due dates, and line items. Get structured JSON and exportable Excel data for AP workflows today.',
                'h1' => 'Invoice Parser for Structured Financial Data',
                'intro' => [
                    'An invoice parser should give your team structured data that is ready for payable operations, not just raw OCR text. Docset focuses on extracting the fields AP teams actually need: invoice IDs, dates, totals, tax values, and line-item detail.',
                    'This page is for teams implementing invoice parsing at scale, where consistency, review controls, and export flexibility across JSON, Excel, and Google Sheets matter more than one-off conversion.',
                ],
                'whatIs' => [
                    'Invoice parsing is the process of turning invoice documents into normalized records. It includes header extraction, numeric checks, and optional line-item capture.',
                    'Docset parser workflows support both UI-based processing and API-driven ingestion. You can keep one schema for recurring invoice formats and evolve it as supplier templates change.',
                    'The output can be consumed as JSON for integrations or sent to Excel and Google Sheets for operational teams that still review and reconcile in spreadsheets.',
                ],
                'extractFields' => [
                    ['field' => 'Invoice header', 'example' => 'invoice_number, invoice_date, due_date'],
                    ['field' => 'Supplier details', 'example' => 'vendor name, tax ID, address'],
                    ['field' => 'Amounts', 'example' => 'subtotal, tax, discounts, total'],
                    ['field' => 'Payment details', 'example' => 'terms, bank reference, payment method'],
                    ['field' => 'Purchase references', 'example' => 'PO number, contract ID'],
                    ['field' => 'Line items', 'example' => 'SKU, description, qty, unit cost, line total'],
                    ['field' => 'Validation helpers', 'example' => 'currency, confidence flags, missing fields'],
                ],
                'steps' => [
                    [
                        'title' => 'Define parser schema',
                        'description' => 'Create a reusable invoice schema with required header fields and optional line-item arrays.',
                    ],
                    [
                        'title' => 'Process incoming invoices',
                        'description' => 'Upload documents manually, import from Google Drive, or send them through API to parse invoices at the pace your team needs.',
                    ],
                    [
                        'title' => 'Run review and validation',
                        'description' => 'Validate critical financial fields like tax and totals before posting data to downstream systems.',
                    ],
                    [
                        'title' => 'Export structured output',
                        'description' => 'Use JSON for automation and export to Excel or Google Sheets for AP reviews, audits, and exception handling workflows.',
                    ],
                ],
                'useCases' => [
                    'Invoice ingestion pipelines in AP and procurement systems.',
                    'Supplier onboarding flows that require normalized invoice data.',
                    'Three-way match preparation with PO and line-item references.',
                    'Tax reconciliation with extracted VAT and subtotal values.',
                    'Audit workflows needing traceable source and parsed output.',
                    'Cross-border payables where currency and due-date extraction are essential.',
                    'AP managers tracking exception queues in shared Google Sheets.',
                ],
                'example' => [
                    'json' => [
                        'invoice_number' => 'INV-2026-9011',
                        'vendor' => 'Blue Harbor Logistics',
                        'invoice_date' => '2026-02-18',
                        'due_date' => '2026-03-20',
                        'currency' => 'EUR',
                        'subtotal' => 2380.00,
                        'tax' => 499.80,
                        'total' => 2879.80,
                        'line_items' => [
                            [
                                'description' => 'Freight handling',
                                'qty' => 1,
                                'unit_price' => 1800.00,
                                'line_total' => 1800.00,
                            ],
                        ],
                    ],
                    'excelMapping' => [
                        'Sheet 1 columns: invoice_number, vendor, dates, subtotal, tax, total',
                        'Sheet 2 columns: invoice_number, line description, qty, unit_price, line_total',
                    ],
                    'note' => 'Linking line-item rows back to invoice_number keeps reconciliation workflows clean in Excel, Google Sheets, and BI tools.',
                ],
                'security' => [
                    'Invoice files are processed for extraction and validation workflows.',
                    'Security controls include encrypted transfer and encrypted storage.',
                    'Workspace access controls help restrict who can view parsed results.',
                    'You can remove documents and outputs to align with retention requirements.',
                ],
                'faqs' => [
                    [
                        'q' => 'What is the difference between invoice OCR and invoice parser?',
                        'a' => 'OCR reads text. Parsing organizes that text into business fields and structures, including line items and financial totals suitable for AP workflows.',
                    ],
                    [
                        'q' => 'Can I parse invoices with many line items?',
                        'a' => 'Yes. Line-item arrays are supported and can be exported in formats that preserve row-level detail for reconciliation.',
                    ],
                    [
                        'q' => 'Can this parser feed ERP imports?',
                        'a' => 'Yes. Teams commonly map parsed output to ERP import templates using JSON transformations, Excel staging files, or Google Sheets staging tabs.',
                    ],
                    [
                        'q' => 'How do I reduce posting errors?',
                        'a' => 'Use required fields in your schema, validate totals during review, and route exceptions before sending data to accounting systems.',
                    ],
                    [
                        'q' => 'Can I parse invoices in multiple currencies?',
                        'a' => 'Yes. Currency fields can be extracted explicitly so downstream workflows can apply consistent conversion and posting rules.',
                    ],
                    [
                        'q' => 'Is manual review still possible?',
                        'a' => 'Yes. Automation and manual review can be combined, which is useful for high-value invoices and exception-heavy suppliers.',
                    ],
                    [
                        'q' => 'Can we import invoices from Google Drive?',
                        'a' => 'Yes. Connect Google integrations, pick invoice files from Drive, and run the same parser schema used for local uploads or API intake.',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function slugs(): array
    {
        return array_keys($this->all());
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(string $slug, string $locale = 'en'): ?array
    {
        $pages = $this->all();

        $page = $pages[$slug] ?? null;
        if (! $page) {
            return null;
        }

        $normalizedLocale = strtolower($locale);
        if (! in_array($normalizedLocale, ['pt-br', 'pt-pt'], true)) {
            return $page;
        }

        $meta = $this->localizedMeta($slug, $normalizedLocale);
        if (! $meta) {
            return $page;
        }

        $page['title'] = $meta['title'];
        $page['description'] = $meta['description'];
        $page['h1'] = $meta['h1'];
        $localizedContent = $this->localizedContent($slug, $normalizedLocale);

        if ($localizedContent) {
            foreach ($localizedContent as $key => $value) {
                $page[$key] = $value;
            }
        }

        return $page;
    }

    /**
     * @param  array<string, mixed>  $page
     * @return array<string, mixed>
     */
    public function buildStructuredData(array $page, string $canonical, string $locale = 'en'): array
    {
        $normalizedLocale = strtolower($locale);
        $schemaLanguage = $normalizedLocale === 'pt-br' ? 'pt-BR' : ($normalizedLocale === 'pt-pt' ? 'pt-PT' : 'en');

        $faqEntries = array_map(static function (array $faq): array {
            return [
                '@type' => 'Question',
                'name' => $faq['q'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['a'],
                ],
            ];
        }, $page['faqs']);

        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'WebPage',
                    '@id' => $canonical.'#webpage',
                    'url' => $canonical,
                    'name' => $page['title'],
                    'description' => $page['description'],
                    'inLanguage' => $schemaLanguage,
                ],
                [
                    '@type' => 'SoftwareApplication',
                    '@id' => $canonical.'#software',
                    'name' => 'DOCSET',
                    'applicationCategory' => 'BusinessApplication',
                    'operatingSystem' => 'Web',
                    'url' => $canonical,
                    'description' => $page['description'],
                    'offers' => [
                        '@type' => 'Offer',
                        'price' => '0',
                        'priceCurrency' => 'USD',
                        'description' => 'Free plan available',
                    ],
                    'featureList' => [
                        'OCR document extraction',
                        'Invoice and receipt parsing',
                        'JSON, Excel, and Google Sheets output',
                        'Template-based field mapping',
                        'Google Drive document intake',
                        'API integration',
                    ],
                ],
                [
                    '@type' => 'FAQPage',
                    '@id' => $canonical.'#faq',
                    'mainEntity' => $faqEntries,
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function localizedContent(string $slug, string $locale): ?array
    {
        if (! in_array($locale, ['pt-br', 'pt-pt'], true)) {
            return null;
        }

        $content = [
            'invoice-ocr' => [
                'intro' => [
                    'O OCR de faturas/notas no Docset foi feito para equipas que recebem documentos de fornecedores em layouts variados e precisam de dados limpos para planilhas, ERP e fluxos de aprovação. Em vez de digitar campo por campo, a equipa envia o ficheiro, aplica o modelo e revisa os valores extraídos antes de exportar.',
                    'O objetivo é reduzir trabalho repetitivo sem perder controlo operacional. É possível validar número do documento, imposto, datas de vencimento e totais num único ecrã. Depois da revisão, os dados podem ser exportados para Excel, enviados para Google Sheets ou consumidos em JSON por API.',
                ],
                'whatIs' => [
                    'OCR de faturas/notas é o processo de ler PDFs e imagens, reconhecer o texto e mapear o conteúdo para campos estruturados. Na prática, transforma documentos de fornecedores em dados pesquisáveis para conciliação e aprovação.',
                    'No Docset, OCR é combinado com regras de extração configuráveis. A equipa define um esquema com cabeçalho, impostos e itens de linha e reutiliza esse mesmo modelo em cargas recorrentes, incluindo PDFs com várias páginas e digitalizações.',
                    'Como cada fornecedor formata de forma diferente, a qualidade depende de schema bem definido e revisão dos campos críticos. O fluxo foi desenhado para este cenário real: automatizar alto volume sem abdicar de validação humana quando necessário.',
                ],
                'extractFields' => [
                    ['field' => 'Nome do fornecedor', 'example' => 'Northwind Components Ltd'],
                    ['field' => 'ID fiscal do fornecedor', 'example' => 'GB123456789'],
                    ['field' => 'Número da fatura/nota', 'example' => 'INV-2026-00418'],
                    ['field' => 'Data de emissão', 'example' => '2026-02-12'],
                    ['field' => 'Data de vencimento', 'example' => '2026-03-14'],
                    ['field' => 'Moeda', 'example' => 'USD ou EUR'],
                    ['field' => 'Subtotal', 'example' => '12450.00'],
                    ['field' => 'Imposto (VAT/IVA)', 'example' => '2490.00'],
                    ['field' => 'Total geral', 'example' => '14940.00'],
                    ['field' => 'Referência de pedido', 'example' => 'PO-88217'],
                    ['field' => 'Condição de pagamento', 'example' => 'Net 30'],
                    ['field' => 'Itens de linha', 'example' => 'Descrição, quantidade, preço unitário, total da linha'],
                ],
                'steps' => [
                    [
                        'title' => 'Enviar documentos',
                        'description' => 'Envie um ficheiro isolado, um lote de PDFs, ou importe do Google Drive depois de ligar a conta.',
                    ],
                    [
                        'title' => 'Aplicar o schema da fatura/nota',
                        'description' => 'Use um template com campos obrigatórios, arrays de itens e tipos de dados como texto, número e data.',
                    ],
                    [
                        'title' => 'Rever os campos extraídos',
                        'description' => 'Valide totais, impostos, datas e linhas numa interface estruturada antes de aprovar o resultado final.',
                    ],
                    [
                        'title' => 'Exportar ou integrar',
                        'description' => 'Exporte para Excel, publique no Google Sheets ou consuma o JSON em ERP, AP e integrações API.',
                    ],
                ],
                'useCases' => [
                    'Equipas de contas a pagar que recebem documentos de muitos fornecedores.',
                    'Centros de serviços partilhados que querem reduzir lançamento manual.',
                    'Operações financeiras que preparam exportações semanais para ERP.',
                    'Times que mantêm controlo operacional em Google Sheets com dados atualizados.',
                    'Processos de auditoria que exigem histórico consistente por documento.',
                    'Fluxos de matching com PO, fornecedor e total extraídos de forma padronizada.',
                    'Picos sazonais de volume sem necessidade de ampliar equipa no mesmo ritmo.',
                ],
                'example' => [
                    'json' => [
                        'invoice_number' => 'INV-2026-00418',
                        'vendor' => 'Northwind Components Ltd',
                        'invoice_date' => '2026-02-12',
                        'due_date' => '2026-03-14',
                        'currency' => 'USD',
                        'subtotal' => 12450.00,
                        'tax' => 2490.00,
                        'total' => 14940.00,
                        'line_items' => [
                            [
                                'description' => 'Industrial filter cartridge',
                                'qty' => 120,
                                'unit_price' => 85.00,
                                'line_total' => 10200.00,
                            ],
                        ],
                    ],
                    'excelMapping' => [
                        'Coluna A: invoice_number',
                        'Coluna B: vendor',
                        'Coluna C: invoice_date',
                        'Coluna D: due_date',
                        'Coluna E: subtotal',
                        'Coluna F: tax',
                        'Coluna G: total',
                    ],
                    'note' => 'Itens de linha podem ser enviados para um segundo separador no Excel ou Google Sheets, mantendo cabeçalho limpo e detalhe preservado para reconciliação.',
                ],
                'security' => [
                    'Os documentos são processados apenas para extração e revisão.',
                    'Os dados são protegidos com encriptação em trânsito (TLS) e em repouso.',
                    'A equipa define retenção e pode remover ficheiros ao terminar o fluxo.',
                    'Acesso é controlado por conta e integrações API usam credenciais geridas.',
                ],
                'faqs' => [
                    [
                        'q' => 'Consegue lidar com layouts diferentes de fornecedores?',
                        'a' => 'Sim. O template é orientado a campos, por isso o mesmo fluxo cobre vários fornecedores sem precisar criar uma solução separada para cada variação.',
                    ],
                    [
                        'q' => 'Extrai itens de linha além do cabeçalho?',
                        'a' => 'Sim. Pode definir arrays de linhas com descrição, quantidade, preço unitário, imposto e total da linha para validações posteriores.',
                    ],
                    [
                        'q' => 'Posso exportar para Excel e Google Sheets?',
                        'a' => 'Sim. O mesmo mapeamento pode gerar ficheiros Excel e também alimentar Google Sheets para colaboração entre equipas.',
                    ],
                    [
                        'q' => 'Posso importar faturas/notas diretamente do Google Drive?',
                        'a' => 'Sim. Depois de conectar o Google, os ficheiros podem ser selecionados no Drive e processados com o mesmo schema das cargas locais.',
                    ],
                    [
                        'q' => 'Serve para fluxos de aprovação em contas a pagar?',
                        'a' => 'Serve. O padrão mais comum é extrair cabeçalho e totais, validar os campos críticos e só depois enviar para aprovação/ERP.',
                    ],
                    [
                        'q' => 'Preciso de equipa técnica para usar?',
                        'a' => 'Não. Utilizadores não técnicos conseguem enviar, revisar e exportar sem código. A API fica disponível para automação avançada.',
                    ],
                    [
                        'q' => 'Qual é a precisão esperada?',
                        'a' => 'Depende da qualidade do documento, complexidade e schema. A combinação de automação com revisão rápida garante operação confiável em produção.',
                    ],
                ],
            ],
            'receipt-ocr' => [
                'intro' => [
                    'OCR de recibos ajuda equipas financeiras a processar despesas sem copiar valores manualmente de fotos e PDFs. Com Docset, os campos extraídos ficam padronizados para reembolso, contabilidade e auditoria.',
                    'O foco é operacional: capturar comerciante, datas, impostos e totais, validar exceções e exportar para Excel, Google Sheets ou JSON. Isso reduz a limpeza manual típica de fecho mensal.',
                ],
                'whatIs' => [
                    'OCR de recibos converte imagens e PDFs não estruturados em registos utilizáveis. Em vez de guardar apenas o ficheiro, a equipa passa a guardar campos pesquisáveis para conciliação e análise.',
                    'Com schemas de recibo, cada novo upload devolve o mesmo conjunto de campos. Essa consistência facilita políticas de despesas, controle de conformidade e preparação para auditorias.',
                    'Quando a qualidade do documento varia, o modo de revisão permite confirmar totais, impostos e dados de comerciante antes do envio para sistemas a jusante.',
                ],
                'extractFields' => [
                    ['field' => 'Nome do comerciante', 'example' => 'City Office Supplies'],
                    ['field' => 'Endereço do comerciante', 'example' => '315 Market St, Denver CO'],
                    ['field' => 'Número do recibo', 'example' => 'R-882914'],
                    ['field' => 'Data da transação', 'example' => '2026-02-19'],
                    ['field' => 'Hora da transação', 'example' => '14:37'],
                    ['field' => 'Método de pagamento', 'example' => 'Cartão corporativo'],
                    ['field' => 'Subtotal', 'example' => '48.90'],
                    ['field' => 'Imposto', 'example' => '4.16'],
                    ['field' => 'Total', 'example' => '53.06'],
                    ['field' => 'Moeda', 'example' => 'USD'],
                    ['field' => 'Categoria sugerida', 'example' => 'Refeições, transporte, material de escritório'],
                ],
                'steps' => [
                    [
                        'title' => 'Reunir os recibos',
                        'description' => 'Envie fotos do telemóvel, PDFs digitalizados ou importe do Google Drive quando os ficheiros já estiverem centralizados.',
                    ],
                    [
                        'title' => 'Aplicar o template de recibos',
                        'description' => 'Use campos predefinidos para comerciante, datas, impostos, totais e atributos essenciais para política interna.',
                    ],
                    [
                        'title' => 'Validar exceções',
                        'description' => 'Revise campos com baixa confiança, impostos atípicos ou dados em falta antes de concluir.',
                    ],
                    [
                        'title' => 'Exportar para o fluxo de despesas',
                        'description' => 'Entregue registos limpos em Excel, Google Sheets ou JSON para reembolso e escrituração.',
                    ],
                ],
                'useCases' => [
                    'Gestão de despesas com grande volume semanal de comprovativos.',
                    'Consolidação de recibos por centro de custo e equipa.',
                    'Fecho mensal com necessidade de reconciliação rápida.',
                    'Auditorias internas e externas com trilho de evidência.',
                    'Operações de viagem e campo com documentos capturados por telemóvel.',
                    'Empresas que substituem digitação manual em planilhas.',
                    'Gestores a acompanhar despesas em abas partilhadas no Google Sheets.',
                ],
                'example' => [
                    'json' => [
                        'merchant' => 'City Office Supplies',
                        'date' => '2026-02-19',
                        'currency' => 'USD',
                        'subtotal' => 48.90,
                        'tax' => 4.16,
                        'total' => 53.06,
                        'payment_method' => 'Corporate card',
                        'receipt_number' => 'R-882914',
                    ],
                    'excelMapping' => [
                        'Coluna A: date',
                        'Coluna B: merchant',
                        'Coluna C: receipt_number',
                        'Coluna D: subtotal',
                        'Coluna E: tax',
                        'Coluna F: total',
                        'Coluna G: payment_method',
                    ],
                    'note' => 'Para recibos, uma única folha costuma ser suficiente. O mesmo mapeamento pode ser mantido em Excel e Google Sheets.',
                ],
                'security' => [
                    'Recibos são processados apenas para extração.',
                    'Transporte e armazenamento usam encriptação por padrão.',
                    'Acesso por utilizador/equipa ajuda a limitar exposição dos dados.',
                    'A saída estruturada pode ser revista antes de partilha externa.',
                ],
                'faqs' => [
                    [
                        'q' => 'Funciona com fotos tiradas no telemóvel?',
                        'a' => 'Sim. O fluxo aceita formatos de imagem comuns e PDFs digitalizados enviados por email ou outras ferramentas.',
                    ],
                    [
                        'q' => 'Consigo separar imposto e total?',
                        'a' => 'Sim. Imposto e total podem ser capturados em campos numéricos distintos para conciliação e validação de política.',
                    ],
                    [
                        'q' => 'Como ajuda em auditorias?',
                        'a' => 'Cria dados consistentes e pesquisáveis ligados ao ficheiro original, acelerando respostas a pedidos de evidência.',
                    ],
                    [
                        'q' => 'Suporta moedas diferentes?',
                        'a' => 'Sim. O campo de moeda pode ser extraído explicitamente para separar despesas locais e internacionais.',
                    ],
                    [
                        'q' => 'Preciso treinar modelo para começar?',
                        'a' => 'Não. O ponto de partida é definir schema e ajustar regras de revisão conforme volume e complexidade aumentam.',
                    ],
                    [
                        'q' => 'Posso usar API em vez de só planilhas?',
                        'a' => 'Sim. Os mesmos dados podem ser consumidos em JSON via API e também exportados para Excel/Google Sheets.',
                    ],
                    [
                        'q' => 'É possível receber ficheiros do Google Drive?',
                        'a' => 'Sim. Basta conectar a conta Google e selecionar os recibos no Drive para processar com o mesmo template.',
                    ],
                ],
            ],
            'pdf-to-excel' => [
                'intro' => [
                    'Muitas equipas recebem dados críticos em PDF e perdem horas a adaptar esse conteúdo para planilhas. Um conversor de PDF para Excel útil precisa gerar colunas consistentes, não apenas copiar texto visual.',
                    'No Docset, os campos são definidos uma vez e reutilizados em uploads recorrentes. O ficheiro pode vir do computador ou Google Drive, passar por revisão e sair como Excel, Google Sheets ou JSON.',
                ],
                'whatIs' => [
                    'Converter PDF para Excel no Docset significa mapear conteúdo para campos tipados e previsíveis. Isso reduz retrabalho e mantém estrutura compatível com operações financeiras.',
                    'O fluxo foi pensado para documentos recorrentes em que o layout muda ligeiramente ao longo do tempo. Em vez de reconstruir planilhas toda semana, a equipa mantém um template estável.',
                    'Antes de exportar, os campos críticos podem ser revistos para evitar erros de totais, datas e identificadores que normalmente quebram análises e importações.',
                ],
                'extractFields' => [
                    ['field' => 'ID do documento', 'example' => 'INV-2026-8841'],
                    ['field' => 'Entidade', 'example' => 'Acme Manufacturing'],
                    ['field' => 'Data de emissão', 'example' => '2026-02-21'],
                    ['field' => 'Data de vencimento', 'example' => '2026-03-23'],
                    ['field' => 'Referências', 'example' => 'PO, order ID, account ID'],
                    ['field' => 'Moeda e localidade', 'example' => 'USD en-US'],
                    ['field' => 'Valor líquido', 'example' => '8460.00'],
                    ['field' => 'Imposto', 'example' => '1692.00'],
                    ['field' => 'Valor total', 'example' => '10152.00'],
                    ['field' => 'Linhas repetidas', 'example' => 'Itens, quantidades, preços unitários'],
                    ['field' => 'Tags customizadas', 'example' => 'Centro de custo, código do projeto'],
                ],
                'steps' => [
                    [
                        'title' => 'Selecionar template de conversão',
                        'description' => 'Escolha ou crie um schema com as colunas exatas esperadas por quem consome a planilha.',
                    ],
                    [
                        'title' => 'Enviar os PDFs',
                        'description' => 'Converta ficheiros avulsos, lotes recorrentes ou documentos importados do Google Drive.',
                    ],
                    [
                        'title' => 'Rever valores mapeados',
                        'description' => 'Faça validação rápida dos campos críticos, especialmente totais e identificadores.',
                    ],
                    [
                        'title' => 'Exportar para Excel e Google Sheets',
                        'description' => 'Baixe planilhas com colunas consistentes ou sincronize para Sheets, mantendo JSON para integrações API.',
                    ],
                ],
                'useCases' => [
                    'Conversão mensal de faturas/notas para workbook de contas a pagar.',
                    'Exportação de recibos para reembolso e contabilidade.',
                    'Transformação de formulários PDF em tabelas analisáveis.',
                    'Partilha de saídas padronizadas via Google Sheets.',
                    'Consolidação de fontes PDF em modelo único de reporte.',
                    'Redução do tempo de limpeza manual antes de fechamento financeiro.',
                    'Geração de ficheiros estruturados para templates de importação ERP.',
                ],
                'example' => [
                    'json' => [
                        'document_id' => 'INV-2026-8841',
                        'entity' => 'Acme Manufacturing',
                        'issue_date' => '2026-02-21',
                        'due_date' => '2026-03-23',
                        'net' => 8460.00,
                        'tax' => 1692.00,
                        'total' => 10152.00,
                        'project_code' => 'PRJ-47',
                    ],
                    'excelMapping' => [
                        'Coluna A: document_id',
                        'Coluna B: entity',
                        'Coluna C: issue_date',
                        'Coluna D: due_date',
                        'Coluna E: net',
                        'Coluna F: tax',
                        'Coluna G: total',
                        'Coluna H: project_code',
                    ],
                    'note' => 'Pode manter uma folha para cabeçalho e outra para linhas repetidas (como itens), tanto em Excel como em Google Sheets.',
                ],
                'security' => [
                    'PDFs são usados apenas para execução do fluxo de extração.',
                    'A comunicação e armazenamento aplicam encriptação.',
                    'Controlo de acesso por workspace limita exposição dos dados.',
                    'Ficheiros e saídas podem ser removidos conforme política de retenção.',
                ],
                'faqs' => [
                    [
                        'q' => 'É só um conversor de copiar e colar texto?',
                        'a' => 'Não. O foco é conversão estruturada com campos consistentes para operações, análise e importações confiáveis.',
                    ],
                    [
                        'q' => 'Posso manter a mesma ordem de colunas sempre?',
                        'a' => 'Sim. O template permite definir nomes e ordem fixa de campos para cada tipo de documento recorrente.',
                    ],
                    [
                        'q' => 'Consegue converter PDFs com várias páginas?',
                        'a' => 'Sim. PDFs multipágina podem ser processados e mapeados no mesmo registo estruturado.',
                    ],
                    [
                        'q' => 'Funciona para faturas/notas, recibos e formulários?',
                        'a' => 'Sim. Qualquer PDF com dados de negócio pode ser mapeado para os campos definidos e exportado.',
                    ],
                    [
                        'q' => 'Analistas podem validar antes da exportação?',
                        'a' => 'Sim. A revisão faz parte do fluxo para conferir totais, datas e IDs antes da partilha.',
                    ],
                    [
                        'q' => 'Além de Excel também existe saída em API?',
                        'a' => 'Sim. A mesma extração gera JSON para integrações e automações em sistemas downstream.',
                    ],
                    [
                        'q' => 'Posso importar do Drive e exportar para Sheets?',
                        'a' => 'Sim. Depois de ativar integrações Google, o fluxo completo funciona sem reconstruir templates.',
                    ],
                ],
            ],
            'ocr-api' => [
                'intro' => [
                    'A OCR API do Docset foi criada para equipas que precisam de extração programática dentro de sistemas já existentes. Em vez de depender apenas de revisão manual, o ficheiro é enviado por endpoint e a resposta retorna em JSON estruturado.',
                    'Esse padrão é útil quando faturas/notas, recibos e formulários chegam por múltiplos canais e precisam ser normalizados rapidamente para operações financeiras, workflows internos e reporting.',
                ],
                'whatIs' => [
                    'Uma OCR API recebe documentos e devolve campos legíveis por máquina. O ganho está na consistência: aplicações consomem payload previsível mesmo com variações de layout.',
                    'No Docset, a API reutiliza os mesmos schemas que também podem ser testados na interface. As equipas validam campos no UI e depois escalam volume via integração.',
                    'Isso evita manter pipeline de OCR proprietário dentro de casa, sem perder controlo de schema, validações e contrato de saída para sistemas críticos.',
                ],
                'extractFields' => [
                    ['field' => 'Identificadores do documento', 'example' => 'invoice_number, receipt_number'],
                    ['field' => 'Partes envolvidas', 'example' => 'vendor, customer, tax IDs'],
                    ['field' => 'Campos de data', 'example' => 'issue_date, due_date, transaction_date'],
                    ['field' => 'Totais financeiros', 'example' => 'subtotal, tax, total, currency'],
                    ['field' => 'Arrays de itens', 'example' => 'description, qty, amount'],
                    ['field' => 'Referências de negócio', 'example' => 'PO number, account code'],
                    ['field' => 'Campos customizados', 'example' => 'cost center, approval code'],
                ],
                'steps' => [
                    [
                        'title' => 'Autenticar pedidos API',
                        'description' => 'Crie credenciais no painel, configure segurança do cliente e autorize chamadas a partir do backend.',
                    ],
                    [
                        'title' => 'Enviar ficheiros para extração',
                        'description' => 'Submeta PDFs/imagens no endpoint e associe cada envio ao schema adequado; os mesmos schemas podem vir de fluxos com Google Drive.',
                    ],
                    [
                        'title' => 'Acompanhar estado e concluir',
                        'description' => 'Consulte status de processamento e recolha o resultado estruturado ao finalizar.',
                    ],
                    [
                        'title' => 'Distribuir JSON e planilhas',
                        'description' => 'Use JSON em ERP/BI e publique subconjuntos em Excel ou Google Sheets para revisão operacional.',
                    ],
                ],
                'useCases' => [
                    'Automação de ingestão de documentos em contas a pagar.',
                    'Endpoints de captura de recibos em produtos de despesas.',
                    'Normalização de ficheiros de fornecedores antes do ERP.',
                    'Validação antifraude e aprovação com campos extraídos.',
                    'Ferramentas internas com pesquisa por dados de documento.',
                    'Integrações com parceiros que exigem payload estruturado.',
                    'Publicação de dados API em Google Sheets para equipas não técnicas.',
                ],
                'example' => [
                    'json' => [
                        'document_id' => 'doc_9f2a1',
                        'status' => 'completed',
                        'data' => [
                            'invoice_number' => 'INV-2026-00418',
                            'vendor' => 'Northwind Components Ltd',
                            'currency' => 'USD',
                            'total' => 14940.00,
                        ],
                    ],
                    'excelMapping' => [
                        'Campo API data.invoice_number -> Coluna A',
                        'Campo API data.vendor -> Coluna B',
                        'Campo API data.total -> Coluna C',
                    ],
                    'note' => 'Muitas equipas usam JSON para integração técnica e, em paralelo, publicam os mesmos campos em Excel/Google Sheets para controlo financeiro.',
                ],
                'security' => [
                    'Pedidos API usam autenticação por cliente e permissões geridas.',
                    'Transporte em HTTPS e dados protegidos em repouso.',
                    'Credenciais podem ser rotacionadas ou revogadas quando necessário.',
                    'Acesso aos resultados segue o modelo de permissões do workspace.',
                ],
                'faqs' => [
                    [
                        'q' => 'Posso usar só API sem usar a interface?',
                        'a' => 'Sim. Fluxos 100% API são suportados. Muitas equipas usam o UI apenas na fase inicial para ajustar schema.',
                    ],
                    [
                        'q' => 'Qual formato de saída é devolvido?',
                        'a' => 'A resposta vem em JSON estruturado com os campos configurados, incluindo arrays quando há itens de linha.',
                    ],
                    [
                        'q' => 'Como tratar processamento assíncrono?',
                        'a' => 'Envie o documento, consulte o estado e busque o resultado final após conclusão. Esse padrão escala bem para lotes.',
                    ],
                    [
                        'q' => 'Posso definir campos personalizados?',
                        'a' => 'Sim. Schemas customizados são centrais na plataforma para adequar o payload ao seu processo de negócio.',
                    ],
                    [
                        'q' => 'Existe controlo de limite de uso?',
                        'a' => 'Sim. Limites por plano e regras de consumo são aplicados para manter previsibilidade operacional.',
                    ],
                    [
                        'q' => 'Dá para combinar API com exportação em planilhas?',
                        'a' => 'Sim. É comum automatizar ingestão em JSON e manter Excel/Google Sheets para revisão, reporting e exceções.',
                    ],
                    [
                        'q' => 'Documentos do Google Drive entram nesse fluxo?',
                        'a' => 'Sim. Equipes usam Drive para recolha de ficheiros e processam com os mesmos schemas e contratos da API.',
                    ],
                ],
            ],
            'invoice-parser' => [
                'intro' => [
                    'Um parser de faturas/notas deve entregar dados realmente utilizáveis para contas a pagar, e não apenas texto OCR bruto. O Docset foi desenhado para capturar os campos críticos: número do documento, datas, impostos, totais e itens de linha.',
                    'A página foca cenários de produção: alto volume, validação de campos sensíveis e saída flexível em JSON, Excel e Google Sheets para diferentes perfis de utilizador.',
                ],
                'whatIs' => [
                    'Invoice parsing é o processo de normalizar documentos em registos estruturados. Inclui extração de cabeçalho, validação numérica e captura de itens.',
                    'No Docset, o parser funciona tanto na interface como na API. O mesmo schema pode ser reaproveitado e evoluído conforme fornecedores mudam layout.',
                    'A saída estruturada atende equipas técnicas via JSON e equipas operacionais via planilhas, mantendo consistência para reconciliação e auditoria.',
                ],
                'extractFields' => [
                    ['field' => 'Cabeçalho da fatura/nota', 'example' => 'invoice_number, invoice_date, due_date'],
                    ['field' => 'Dados do fornecedor', 'example' => 'vendor name, tax ID, address'],
                    ['field' => 'Montantes', 'example' => 'subtotal, tax, discounts, total'],
                    ['field' => 'Detalhes de pagamento', 'example' => 'terms, bank reference, payment method'],
                    ['field' => 'Referências de compra', 'example' => 'PO number, contract ID'],
                    ['field' => 'Itens de linha', 'example' => 'SKU, description, qty, unit cost, line total'],
                    ['field' => 'Apoio de validação', 'example' => 'currency, confidence flags, missing fields'],
                ],
                'steps' => [
                    [
                        'title' => 'Definir o schema do parser',
                        'description' => 'Crie um modelo reutilizável com campos obrigatórios no cabeçalho e arrays opcionais para itens.',
                    ],
                    [
                        'title' => 'Processar documentos recebidos',
                        'description' => 'Envie manualmente, importe do Google Drive ou use API para manter o ritmo de ingestão da equipa.',
                    ],
                    [
                        'title' => 'Executar revisão e validação',
                        'description' => 'Valide valores financeiros críticos como impostos e total antes do envio para sistemas finais.',
                    ],
                    [
                        'title' => 'Distribuir saída estruturada',
                        'description' => 'Use JSON para automação e exporte Excel/Google Sheets para revisão de AP, auditoria e tratamento de exceções.',
                    ],
                ],
                'useCases' => [
                    'Pipelines de ingestão de documentos em AP e procurement.',
                    'Onboarding de fornecedores com normalização obrigatória de dados.',
                    'Preparação para matching com PO e linhas detalhadas.',
                    'Reconciliação fiscal com extração consistente de impostos.',
                    'Auditorias que exigem ligação entre fonte e saída parseada.',
                    'Operações multi-moeda com foco em data de vencimento e montantes.',
                    'Gestão de filas de exceção em Google Sheets partilhados.',
                ],
                'example' => [
                    'json' => [
                        'invoice_number' => 'INV-2026-9011',
                        'vendor' => 'Blue Harbor Logistics',
                        'invoice_date' => '2026-02-18',
                        'due_date' => '2026-03-20',
                        'currency' => 'EUR',
                        'subtotal' => 2380.00,
                        'tax' => 499.80,
                        'total' => 2879.80,
                        'line_items' => [
                            [
                                'description' => 'Freight handling',
                                'qty' => 1,
                                'unit_price' => 1800.00,
                                'line_total' => 1800.00,
                            ],
                        ],
                    ],
                    'excelMapping' => [
                        'Folha 1: invoice_number, vendor, datas, subtotal, tax, total',
                        'Folha 2: invoice_number, descrição, qty, unit_price, line_total',
                    ],
                    'note' => 'Ligar linhas ao invoice_number facilita reconciliação no Excel, Google Sheets e ferramentas de BI.',
                ],
                'security' => [
                    'Os ficheiros são usados apenas para extração e validação.',
                    'Controles incluem encriptação em trânsito e armazenamento protegido.',
                    'Permissões por workspace limitam quem pode ver resultados parseados.',
                    'Documentos e saídas podem ser apagados para cumprir retenção interna.',
                ],
                'faqs' => [
                    [
                        'q' => 'Qual diferença entre OCR de fatura/nota e parser?',
                        'a' => 'OCR lê texto. Parser organiza esse texto em estrutura de negócio com campos financeiros e itens prontos para operação.',
                    ],
                    [
                        'q' => 'Suporta documentos com muitos itens?',
                        'a' => 'Sim. Arrays de itens são suportados e podem ser exportados preservando detalhe por linha para reconciliação.',
                    ],
                    [
                        'q' => 'Esse parser pode alimentar importação ERP?',
                        'a' => 'Sim. É comum mapear a saída para templates ERP com transformação JSON, ficheiros Excel ou staging em Google Sheets.',
                    ],
                    [
                        'q' => 'Como reduzir erros antes do lançamento?',
                        'a' => 'Defina campos obrigatórios, valide totais na revisão e trate exceções antes de enviar para contabilidade.',
                    ],
                    [
                        'q' => 'Posso processar documentos em várias moedas?',
                        'a' => 'Sim. O campo de moeda pode ser extraído e usado para regras de conversão e contabilização.',
                    ],
                    [
                        'q' => 'Ainda posso fazer revisão manual quando preciso?',
                        'a' => 'Sim. Automação e revisão manual coexistem, especialmente útil para documentos de alto valor e casos de exceção.',
                    ],
                    [
                        'q' => 'Consigo importar ficheiros do Google Drive?',
                        'a' => 'Sim. Após ligar integrações Google, os ficheiros são escolhidos no Drive e processados com o mesmo schema.',
                    ],
                ],
            ],
        ];

        return $content[$slug] ?? null;
    }

    /**
     * @return array{title: string, description: string, h1: string}|null
     */
    private function localizedMeta(string $slug, string $locale): ?array
    {
        $meta = [
            'pt-br' => [
                'invoice-ocr' => [
                    'title' => 'OCR de Notas Fiscais para AP e Exportação ERP | DOCSET',
                    'description' => 'OCR de notas fiscais para extrair totais, impostos, vencimentos e itens de linha em JSON ou Excel. Reduza digitação manual no contas a pagar.',
                    'h1' => 'OCR de Notas Fiscais para Contas a Pagar',
                ],
                'receipt-ocr' => [
                    'title' => 'OCR de Recibos para Despesas e Auditorias | DOCSET',
                    'description' => 'OCR de recibos para extrair estabelecimento, valor, imposto e data em JSON ou Excel. Acelere o processamento de despesas com menos retrabalho.',
                    'h1' => 'OCR de Recibos para Processamento de Despesas',
                ],
                'pdf-to-excel' => [
                    'title' => 'Conversor de PDF para Excel para Times Financeiros | DOCSET',
                    'description' => 'Converta PDF para Excel com colunas estruturadas para notas, recibos e formulários. Menos limpeza manual e mais velocidade operacional.',
                    'h1' => 'Conversão de PDF para Excel com Dados Estruturados',
                ],
                'ocr-api' => [
                    'title' => 'API de OCR para Extração de Dados de Documentos | DOCSET',
                    'description' => 'API de OCR para extrair campos de notas, recibos e PDFs com saída em JSON. Automatize fluxos de documentos sem entrada manual.',
                    'h1' => 'API de OCR para Extração Estruturada de Dados',
                ],
                'invoice-parser' => [
                    'title' => 'Parser de Nota Fiscal com Itens, Impostos e Totais | DOCSET',
                    'description' => 'Parser de nota fiscal para capturar cabeçalho, impostos, vencimentos e itens de linha em JSON e Excel. Mais controle para operações de AP.',
                    'h1' => 'Parser de Nota Fiscal para Dados Financeiros',
                ],
            ],
            'pt-pt' => [
                'invoice-ocr' => [
                    'title' => 'OCR de Faturas para AP e Exportação ERP | DOCSET',
                    'description' => 'OCR de faturas para extrair totais, impostos, vencimentos e linhas em JSON ou Excel. Reduza a introdução manual no contas a pagar.',
                    'h1' => 'OCR de Faturas para Equipas de Contas a Pagar',
                ],
                'receipt-ocr' => [
                    'title' => 'OCR de Recibos para Despesas e Auditorias | DOCSET',
                    'description' => 'OCR de recibos para extrair comerciante, valor, imposto e data em JSON ou Excel. Acelere o tratamento de despesas com menos retrabalho.',
                    'h1' => 'OCR de Recibos para Tratamento de Despesas',
                ],
                'pdf-to-excel' => [
                    'title' => 'Conversor de PDF para Excel para Operações Financeiras | DOCSET',
                    'description' => 'Converta PDF para Excel com colunas estruturadas para faturas, recibos e formulários. Menos limpeza manual e mais velocidade operacional.',
                    'h1' => 'Conversão de PDF para Excel com Dados Estruturados',
                ],
                'ocr-api' => [
                    'title' => 'API de OCR para Extração de Dados de Documentos | DOCSET',
                    'description' => 'API de OCR para extrair campos de faturas, recibos e PDFs em JSON. Automatize fluxos documentais sem introdução manual de dados.',
                    'h1' => 'API de OCR para Extração Estruturada de Dados',
                ],
                'invoice-parser' => [
                    'title' => 'Parser de Faturas com Linhas, Impostos e Totais | DOCSET',
                    'description' => 'Parser de faturas para capturar cabeçalho, impostos, vencimentos e linhas em JSON e Excel. Mais controlo para operações de AP.',
                    'h1' => 'Parser de Faturas para Dados Financeiros',
                ],
            ],
        ];

        return $meta[$locale][$slug] ?? null;
    }
}
