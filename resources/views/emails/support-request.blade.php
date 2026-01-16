@extends('emails.layout')

@section('content')
    <div class="greeting">
        Olá Equipe de Suporte,
    </div>

    <p>
        Uma nova solicitação de suporte foi recebida através da plataforma.
    </p>

    <div class="steps">
        <div class="step-item">Usuário: {{ $user->name }}</div>
        <div class="step-item">Email: {{ $user->email }}</div>
        @if(isset($data['subject']))
        <div class="step-item">Assunto: {{ $data['subject'] }}</div>
        @endif
    </div>

    <h1>Mensagem:</h1>
    <div class="message-box">
        {!! nl2br(e($data['message'])) !!}
    </div>

    <div class="signature">
        Este email foi enviado automaticamente pelo sistema de suporte do {{ config('app.name') }}.
    </div>
@endsection
