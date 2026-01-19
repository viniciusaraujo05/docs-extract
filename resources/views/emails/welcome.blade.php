@extends('emails.layout')

@section('content')
<h1>{{ __('emails.welcome.title') }}</h1>
<p>{{ __('emails.welcome.content') }}</p>

<div class="steps">
    <div class="step-item">{{ __('emails.welcome.step_1') }}</div>
    <div class="step-item">{{ __('emails.welcome.step_2') }}</div>
</div>

<div class="button-container">
    <a href="{{ config('app.url') . '/' . $locale . '/dashboard' }}" class="button">{{ __('emails.welcome.button') }}</a>
</div>

<p>
    {{ __('emails.welcome.signature') }}
</p>
@endsection
