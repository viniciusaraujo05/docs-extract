@extends('emails.layout')

@section('content')
<h1>{{ __('emails.usage_limit.title') }}</h1>
<p>{{ __('emails.usage_limit.content', ['plan' => $plan]) }}</p>
<p>{{ __('emails.usage_limit.upgrade_cta') }}</p>

<div class="button-container">
    <a href="{{ config('app.url') . '/' . $locale . '/settings/billing' }}" class="button">{{ __('emails.usage_limit.button') }}</a>
</div>
@endsection
