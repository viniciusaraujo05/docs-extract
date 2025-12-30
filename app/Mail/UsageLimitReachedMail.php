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

    public function __construct($plan)
    {
        $this->plan = $plan;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.usage_limit.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.usage-limit',
        );
    }
}
