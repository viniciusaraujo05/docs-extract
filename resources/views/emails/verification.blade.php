@extends('emails.layout')

@section('content')
<h1>{{ __('emails.verification.title') }}</h1>
<p>{{ __('emails.verification.content') }}</p>

<div class="button-container">
    <a href="{{ $url }}" class="button">{{ __('emails.verification.button') }}</a>
</div>

<p>{{ __('emails.verification.expiration', ['count' => $count]) }}</p>

<div class="subtext">
    {!! __('emails.verification.trouble', ['actionText' => __('emails.verification.button')]) !!}
    <br>
    <a href="{{ $url }}">{{ $url }}</a>
</div>
@endsection
