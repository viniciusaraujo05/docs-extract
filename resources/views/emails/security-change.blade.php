@extends('emails.layout')

@section('content')
<h1>{{ __('emails.security_change.title') }}</h1>
<p>{{ __('emails.security_change.content', ['field' => $field]) }}</p>

<div class="subtext">
    {{ __('emails.security_change.warning') }}
</div>

<div class="button-container">
    <a href="mailto:support@docset.io" class="button">{{ __('emails.security_change.button') }}</a>
</div>
@endsection
