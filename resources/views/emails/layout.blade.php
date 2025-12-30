<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            background-color: #f8fafc;
            color: #334155;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }
        .wrapper {
            background-color: #f8fafc;
            padding: 40px 20px;
        }
        .content {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin: 0 auto;
            max-width: 600px;
            overflow: hidden;
        }
        .header {
            background-color: #ffffff;
            padding: 40px 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            text-decoration: none;
            letter-spacing: -0.025em;
        }
        .body {
            padding: 0 40px 40px;
        }
        h1 {
            color: #0f172a;
            font-size: 22px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
            text-align: center;
        }
        p {
            font-size: 16px;
            margin-bottom: 24px;
        }
        .button-container {
            text-align: center;
            margin-bottom: 32px;
        }
        .button {
            background-color: #2563eb;
            border-radius: 8px;
            color: #ffffff !important;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            padding: 14px 32px;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .footer {
            padding: 20px 40px 40px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .subtext {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 24px;
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
        }
        .steps {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .step-item {
            margin-bottom: 12px;
            font-weight: 500;
        }
        .step-item:last-child {
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="content">
            <div class="header">
                <a href="{{ config('app.url') }}" class="logo">DOCSET</a>
            </div>
            <div class="body">
                @yield('content')
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
