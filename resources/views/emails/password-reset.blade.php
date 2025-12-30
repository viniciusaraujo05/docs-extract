@extends('emails.layout')

@section('content')
<h1>{{ __('emails.password_reset.title') }}</h1>
<p>{{ __('emails.password_reset.content') }}</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">{{ __('emails.password_reset.button') }}</a>
</div>

<p>{{ __('emails.password_reset.expiration', ['count' => $count]) }}</p>
<p>{{ __('emails.password_reset.security_notice') }}</p>

<div class="subtext">
    {{ __('emails.password_reset.ignore') }}
</div>
@endsection
