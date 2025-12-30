<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $url;
    public $count;

    public function __construct($url, $count = 60)
    {
        $this->url = $url;
        $this->count = $count;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.password_reset.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
        );
    }
}
