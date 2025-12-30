@extends('emails.layout')

@section('content')
<h1>{{ __('emails.payment_success.title') }}</h1>
<p>{{ __('emails.payment_success.content', ['plan' => $plan]) }}</p>
<p>{{ __('emails.payment_success.start_date', ['date' => $date]) }}</p>

<div class="button-container">
    <a href="{{ config('app.url') . '/settings/billing' }}" class="button">{{ __('emails.payment_success.billing_link') }}</a>
</div>

<div class="subtext">
    {{ __('emails.payment_success.stripe_notice') }}
</div>
@endsection
