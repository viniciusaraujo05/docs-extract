# Sitemap.xml - Documentação

## Visão Geral

O sitemap.xml do DOCSET foi otimizado para indexação no Google e outros motores de busca, seguindo as melhores práticas de SEO para Laravel 12.

## Estrutura do Sitemap

### URLs Incluídas

#### 1. **Landing Pages (Prioridade: 1.0)**
- `/` - Homepage (redireciona para idioma preferido)
- `/en` - Landing page em inglês
- `/pt` - Landing page em português (PT-BR e PT-PT)

**Características:**
- Frequência de atualização: `daily`
- Inclui imagem do logo (`/docset.png`)
- Links alternativos para todos os idiomas (hreflang)
- Prioridade máxima para melhor indexação

#### 2. **Seções da Landing Page (Prioridade: 0.8-0.9)**
- `/en#features` e `/pt#features` - Seção de recursos
- `/en#pricing` e `/pt#pricing` - Seção de preços
- `/en#api` e `/pt#api` - Seção de API para desenvolvedores

**Características:**
- Frequência de atualização: `weekly`
- Links alternativos para idiomas
- Alta prioridade para conteúdo importante

#### 3. **Páginas de Registro (Prioridade: 0.8)**
- `/en/register` - Registro em inglês
- `/pt/register` - Registro em português

**Características:**
- Frequência de atualização: `monthly`
- Alta prioridade para conversão

#### 4. **Páginas de Login (Prioridade: 0.4)**
- `/en/login` - Login em inglês
- `/pt/login` - Login em português

**Características:**
- Frequência de atualização: `monthly`
- Prioridade média-baixa

#### 5. **Páginas Legais (Prioridade: 0.5)**
- `/en/privacy` e `/pt/privacy` - Política de privacidade
- `/en/terms` e `/pt/terms` - Termos de serviço

**Características:**
- Frequência de atualização: `monthly`
- Prioridade média

## Recursos de SEO Implementados

### 1. **Suporte Multilíngue (hreflang)**
Todas as páginas principais incluem tags `xhtml:link` com atributos `hreflang`:
- `en` - Inglês
- `pt-BR` - Português do Brasil
- `pt-PT` - Português de Portugal
- `x-default` - Idioma padrão (inglês)

### 2. **Imagens no Sitemap**
O logo do DOCSET (`/docset.png`) está incluído no sitemap com:
- `<image:loc>` - URL da imagem
- `<image:title>` - Título descritivo
- `<image:caption>` - Legenda para contexto

### 3. **Metadados Temporais**
- `<lastmod>` - Data/hora da última modificação (atualizada dinamicamente)
- `<changefreq>` - Frequência de atualização esperada
- `<priority>` - Prioridade relativa das páginas (0.0 a 1.0)

## Acesso ao Sitemap

### URL Principal
```
https://seu-dominio.com/sitemap.xml
```

### Cache
O sitemap é cacheado por 1 hora (3600 segundos) para melhor performance.

## Configuração Técnica

### Controller
`App\Http\Controllers\SitemapController@index`

### Rota
```php
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
```

### Middleware
O middleware `SetLocale` foi configurado para **não redirecionar** requisições ao `sitemap.xml`, permitindo acesso direto sem prefixo de idioma.

## Submissão ao Google

### Google Search Console
1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Adicione sua propriedade (domínio)
3. Vá em **Sitemaps** no menu lateral
4. Adicione a URL: `https://seu-dominio.com/sitemap.xml`
5. Clique em **Enviar**

### Robots.txt
O sitemap também está referenciado no `robots.txt`:
```
Sitemap: https://seu-dominio.com/sitemap.xml
```

## Validação

### Ferramentas de Validação
- [Google Search Console - Teste de Sitemap](https://search.google.com/search-console)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)

### Teste Local
```bash
curl http://localhost/sitemap.xml
```

## Manutenção

### Quando Atualizar o Sitemap

1. **Adicionar novas páginas públicas**
   - Edite `app/Http/Controllers/SitemapController.php`
   - Adicione a nova URL ao array `$pages`

2. **Alterar prioridades**
   - Ajuste o valor de `priority` (0.0 a 1.0)
   - Páginas mais importantes devem ter prioridade maior

3. **Modificar frequência de atualização**
   - Valores válidos: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`

### Limpeza de Cache
```bash
sail artisan route:clear
sail artisan config:clear
sail artisan cache:clear
```

## Boas Práticas

1. **Prioridade**
   - Homepage: 1.0
   - Páginas principais: 0.8-0.9
   - Páginas secundárias: 0.5-0.7
   - Páginas de baixa importância: 0.3-0.4

2. **Frequência de Atualização**
   - Conteúdo dinâmico: `daily` ou `weekly`
   - Conteúdo estático: `monthly` ou `yearly`

3. **Limite de URLs**
   - Máximo de 50.000 URLs por sitemap
   - Para mais URLs, use um índice de sitemaps

4. **Tamanho do Arquivo**
   - Máximo de 50MB (não comprimido)
   - Máximo de 10MB (comprimido com gzip)

## Monitoramento

### Métricas Importantes
- Taxa de indexação no Google Search Console
- Erros de rastreamento
- Páginas descobertas vs. indexadas
- Tempo de resposta do sitemap

### Alertas
Configure alertas para:
- Erros 404 em URLs do sitemap
- Tempo de resposta > 3 segundos
- Mudanças significativas na taxa de indexação

## Recursos Adicionais

- [Documentação oficial do Google sobre Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Protocolo Sitemap XML](https://www.sitemaps.org/protocol.html)
- [Guia de SEO do Laravel](https://laravel.com/docs/12.x)
