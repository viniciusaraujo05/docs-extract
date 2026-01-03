<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public $plan;
    public $date;
    public $locale;

    public function __construct($plan, $date, $locale = null)
    {
        $this->plan = $plan;
        $this->date = $date;
        $this->locale = $locale ?? app()->getLocale();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.payment_success.subject', [], $this->locale),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-success',
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
