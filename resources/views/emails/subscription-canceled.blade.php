@extends('emails.layout')

@section('content')
<h1>{{ __('emails.subscription_canceled.title') }}</h1>
<p>{{ __('emails.subscription_canceled.content') }}</p>
<p>{{ __('emails.subscription_canceled.access_until', ['date' => $date]) }}</p>
<p>{{ __('emails.subscription_canceled.post_cancel') }}</p>

<div class="subtext">
    {{ __('emails.subscription_canceled.feedback') }}
</div>
@endsection
