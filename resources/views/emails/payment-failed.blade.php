@extends('emails.layout')

@section('content')
<h1>{{ __('emails.payment_failed.title') }}</h1>
<p>{{ __('emails.payment_failed.content') }}</p>

<div class="button-container">
    <a href="{{ config('app.url') . '/settings/billing' }}" class="button">{{ __('emails.payment_failed.button') }}</a>
</div>

<p>{{ __('emails.payment_failed.deadline', ['days' => $days]) }}</p>
@endsection
