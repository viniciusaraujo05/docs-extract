<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $url;
    public $count;
    public $locale;

    public function __construct($url, $count = 60, $locale = null)
    {
        $this->url = $url;
        $this->count = $count;
        $this->locale = $locale ?? app()->getLocale();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.verification.subject', [], $this->locale),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification',
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
