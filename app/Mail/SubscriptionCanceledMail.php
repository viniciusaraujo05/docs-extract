<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionCanceledMail extends Mailable
{
    use Queueable, SerializesModels;

    public $date;

    public function __construct($date)
    {
        $this->date = $date;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.subscription_canceled.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-canceled',
        );
    }
}
