<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Welcome to DocSet! 🎉'))
            ->greeting(__('So glad to have you here! 🎉'))
            ->line(__('We\'re super excited to be part of your journey! DOCSET will transform the way you process documents. Let\'s get started?'))
            ->line(__('📄 Upload your first document'))
            ->line(__('🎯 Set up your extraction model'))
            ->action(__('Go to Dashboard'), url(route('dashboard', ['locale' => $notifiable->locale ?? 'en'] ?? 'en')));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
