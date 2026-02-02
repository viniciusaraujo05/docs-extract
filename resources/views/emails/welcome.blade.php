@extends('emails.layout')

@section('content')
<h1>{{ __('emails.welcome.title') }}</h1>
<div class="greeting">{{ __('emails.welcome.content') }}</div>

<div class="steps">
    <div class="step-item">{{ __('emails.welcome.step_1') }}</div>
    <div class="step-item">{{ __('emails.welcome.step_2') }}</div>
</div>

<div class="button-container">
    <a href="{{ config('app.url') . '/' . $locale . '/documents' }}" class="button">{{ __('emails.welcome.button') }}</a>
</div>

<div class="signature">
    {{ __('emails.welcome.signature') }}
</div>
@endsection
