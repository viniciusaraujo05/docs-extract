<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityChangeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $field;
    public $locale;

    public function __construct($field, $locale = null)
    {
        $this->field = $field;
        $this->locale = $locale ?? app()->getLocale();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.security_change.subject', [], $this->locale),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.security-change',
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
