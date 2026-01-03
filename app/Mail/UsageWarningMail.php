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
    public $locale;

    public function __construct($used, $total, $locale = null)
    {
        $this->used = $used;
        $this->total = $total;
        $this->locale = $locale ?? app()->getLocale();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.usage_warning.subject', [], $this->locale),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.usage-warning',
            with: [
                'locale' => $this->locale,
            ],
        );
    }

    public function build()
    {
        app()->setLocale($this->locale);
        return $this;
    }
}
