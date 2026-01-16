<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

use Illuminate\Mail\Mailables\Attachment;

class SupportRequestMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $data;
    public $attachmentPaths;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, array $data, array $attachmentPaths = [])
    {
        $this->user = $user;
        $this->data = $data;
        $this->attachmentPaths = $attachmentPaths;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Support Request] ' . ($this->data['subject'] ?? 'New Message'),
            replyTo: [$this->user->email],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.support-request',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return array_map(function ($path) {
            return Attachment::fromStorage($path);
        }, $this->attachmentPaths);
    }
}
