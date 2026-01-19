@extends('emails.layout')

@section('content')
<h1>{{ __('emails.subscription_canceled.title') }}</h1>
<p>{{ __('emails.subscription_canceled.content') }}</p>

<div class="highlight-box" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
    <p style="margin: 0;">{{ __('emails.subscription_canceled.access_until', ['date' => $date]) }}</p>
</div>

<p>{{ __('emails.subscription_canceled.post_cancel') }}</p>

<div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
    <p style="font-size: 16px; margin-bottom: 16px;">{{ __('emails.subscription_canceled.comeback_message') }}</p>
    <a href="{{ url('/') }}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        {{ __('emails.subscription_canceled.comeback_button') }}
    </a>
</div>

<div class="subtext" style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
    <p>{{ __('emails.subscription_canceled.feedback') }}</p>
    <p style="margin-top: 16px; font-style: italic;">{{ __('emails.subscription_canceled.signature') }}</p>
</div>
@endsection

