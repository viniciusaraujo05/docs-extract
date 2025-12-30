<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PlanChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $old;
    public $new;

    public function __construct($old, $new)
    {
        $this->old = $old;
        $this->new = $new;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.plan_changed.subject'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.plan-changed',
        );
    }
}
