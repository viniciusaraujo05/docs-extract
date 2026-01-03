<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UsageLimitReachedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $plan;
    public $locale;

    public function __construct($plan, $locale = null)
    {
        $this->plan = $plan;
        $this->locale = $locale ?? app()->getLocale();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.usage_limit.subject', [], $this->locale),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.usage-limit',
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
