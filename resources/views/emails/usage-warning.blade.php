@extends('emails.layout')

@section('content')
<h1>{{ __('emails.usage_warning.title') }}</h1>
<p>{{ __('emails.usage_warning.content') }}</p>
<p>{{ __('emails.usage_warning.current_usage', ['used' => $used, 'total' => $total]) }}</p>

<div class="button-container">
    <a href="{{ config('app.url') . '/dashboard' }}" class="button">{{ __('emails.usage_warning.button') }}</a>
</div>
@endsection
