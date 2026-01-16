<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            background-color: #09090b; /* Zinc 950 */
            color: #d4d4d8; /* Zinc 300 */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }
        .wrapper {
            padding: 40px 20px;
            background-color: #09090b;
        }
        .content {
            background-color: #18181b; /* Zinc 900 */
            border: 1px solid #27272a; /* Zinc 800 */
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin: 0 auto;
            max-width: 600px;
            overflow: hidden;
            color: #e4e4e7; /* Zinc 200 */
        }
        .header {
            background-color: #09090b; /* Zinc 950 */
            padding: 40px 40px 30px;
            text-align: center;
            border-bottom: 1px solid #27272a;
        }
        .logo-container {
            display: inline-block;
            margin-bottom: 16px;
            padding: 12px;
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .logo-img {
            height: 48px;
            width: auto;
            display: block;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.025em;
            display: block;
        }
        .body {
            padding: 40px;
        }
        h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
            text-align: center;
            line-height: 1.3;
        }
        p {
            font-size: 16px;
            margin-bottom: 24px;
            color: #a1a1aa; /* Zinc 400 */
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            background-color: #2563eb; /* Blue 600 */
            border-radius: 8px;
            color: #ffffff !important;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            padding: 14px 32px;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            transition: all 0.2s;
        }
        .button:hover {
            background-color: #1d4ed8; /* Blue 700 */
        }
        .footer {
            background-color: #09090b;
            padding: 32px 40px;
            text-align: center;
            font-size: 13px;
            color: #52525b; /* Zinc 600 */
            border-top: 1px solid #27272a;
        }
        .footer-links {
            margin-top: 16px;
        }
        .footer-link {
            color: #71717a;
            text-decoration: none;
            margin: 0 8px;
            transition: color 0.2s;
        }
        .footer-link:hover {
            color: #a1a1aa;
        }
        .subtext {
            font-size: 13px;
            color: #52525b;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #27272a;
            line-height: 1.6;
        }
        .steps {
            background-color: #27272a; /* Zinc 800 */
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            border-left: 3px solid #3b82f6; /* Blue 500 */
        }
        .step-item {
            margin-bottom: 12px;
            font-weight: 500;
            color: #e4e4e7;
            padding-left: 8px;
        }
        .step-item:last-child {
            margin-bottom: 0;
        }
        .greeting {
            font-size: 16px;
            color: #e4e4e7;
            margin-bottom: 24px;
        }
        .signature {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #27272a;
            color: #71717a;
            font-style: italic;
        }
        .message-box {
            background-color: #27272a; /* Zinc 800 */
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 24px;
            border: 1px solid #3f3f46; /* Zinc 700 */
            color: #e4e4e7;
            font-family: monospace;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="content">
            <div class="header">
                <div class="logo-container">
                    <img src="{{ config('app.url') }}/docset.png" alt="DOCSET Logo" class="logo-img" />
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
