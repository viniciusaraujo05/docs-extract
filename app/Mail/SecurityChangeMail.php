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

    public function __construct($field)
    {
        $this->field = $field;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.security_change.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.security-change',
        );
    }
}
