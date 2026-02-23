<x-mail::message>
@if($locale === 'pt')
# Inscrição Confirmada!

Obrigado por assinar a newsletter do **Docset**. A partir de agora, você receberá nossas últimas atualizações de produto, dicas e tutoriais diretamente na sua caixa de entrada.

Prometemos enviar apenas conteúdo relevante e valioso.

<x-mail::button :url="config('app.url') . '/pt/blog'">
Acessar o Blog
</x-mail::button>

Abraços,<br>
Equipe {{ config('app.name') }}
@else
# Subscription Confirmed!

Thank you for subscribing to the **Docset** newsletter. From now on, you'll receive our latest product updates, tips, and tutorials directly in your inbox.

We promise to send only relevant and valuable content.

<x-mail::button :url="config('app.url') . '/en/blog'">
Read our Blog
</x-mail::button>

Best regards,<br>
The {{ config('app.name') }} Team
@endif
</x-mail::message>
