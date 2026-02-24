import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
    const { t } = useTranslation();
    const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en';
    const validLocales = ['en', 'pt', 'pt-PT', 'pt-BR'];
    const currentLocale = validLocales.includes(locale) ? locale : 'en';

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
            <Head>
                <title>404: Page Not Found - Docset</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400">
                    <Search className="h-10 w-10" />
                </div>
                
                <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
                    404
                </h1>
                <h2 className="mb-6 text-2xl font-semibold text-zinc-300 sm:text-3xl">
                    Page not found
                </h2>
                <p className="mx-auto mb-10 max-w-md text-lg text-zinc-400">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                        href={`/${currentLocale}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Home
                    </Link>
                    <Link
                        href={`/${currentLocale}/blog`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        Read our Blog
                    </Link>
                </div>
            </div>
        </div>
    );
}
