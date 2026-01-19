@extends('emails.layout')

@section('content')
<h1>{{ __('emails.plan_changed.title') }}</h1>
<p>{{ __('emails.plan_changed.content', ['old' => $old, 'new' => $new]) }}</p>
<p>{{ __('emails.plan_changed.effective_date') }}</p>

<div class="button-container">
    <a href="{{ config('app.url') . '/' . $locale . '/settings/billing' }}" class="button">{{ __('emails.plan_changed.button') }}</a>
</div>
@endsection
