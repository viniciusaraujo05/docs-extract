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

    public function __construct($plan, $date)
    {
        $this->plan = $plan;
        $this->date = $date;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.payment_success.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-success',
        );
    }
}
