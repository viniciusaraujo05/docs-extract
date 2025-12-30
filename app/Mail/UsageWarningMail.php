<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UsageWarningMail extends Mailable
{
    use Queueable, SerializesModels;

    public $used;
    public $total;

    public function __construct($used, $total)
    {
        $this->used = $used;
        $this->total = $total;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.usage_warning.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.usage-warning',
        );
    }
}
