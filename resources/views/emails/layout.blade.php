<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #1f2937;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, Arial, sans-serif;
            line-height: 1.7;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }
        .wrapper {
            padding: 50px 20px;
        }
        .content {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            margin: 0 auto;
            max-width: 600px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 40px 35px;
            text-align: center;
            border-bottom: 4px solid #5a67d8;
        }
        .logo-container {
            display: inline-block;
            margin-bottom: 10px;
        }
        .logo-img {
            height: 50px;
            width: auto;
            filter: brightness(0) invert(1);
        }
        .logo-text {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.025em;
            display: block;
            margin-top: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .body {
            padding: 40px 40px 40px;
        }
        h1 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 28px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
            text-align: center;
            line-height: 1.3;
        }
        p {
            font-size: 16px;
            margin-bottom: 20px;
            color: #374151;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: #ffffff !important;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            padding: 16px 40px;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }
        .button:hover {
            box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer-links {
            margin-top: 12px;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
            margin: 0 8px;
        }
        .subtext {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            line-height: 1.6;
        }
        .steps {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 12px;
            padding: 28px;
            margin-bottom: 28px;
            border-left: 4px solid #667eea;
        }
        .step-item {
            margin-bottom: 14px;
            font-weight: 500;
            color: #1f2937;
            padding-left: 8px;
        }
        .step-item:last-child {
            margin-bottom: 0;
        }
        .greeting {
            font-size: 17px;
            color: #4b5563;
            margin-bottom: 24px;
        }
        .signature {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="content">
            <div class="header">
                <div class="logo-container">
                    <img src="{{ config('app.url') }}/logo.svg" alt="DOCSET Logo" class="logo-img" />
                </div>
                <span class="logo-text">DOCSET</span>
            </div>
            <div class="body">
                @yield('content')
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
                <div class="footer-links">
                    <a href="{{ config('app.url') }}/terms" class="footer-link">Termos de Uso</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="{{ config('app.url') }}/privacy" class="footer-link">Privacidade</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="mailto:suporte@docset.io" class="footer-link">Suporte</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
