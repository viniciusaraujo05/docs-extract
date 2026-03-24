import SEOHead from '@/components/seo/SEOHead';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { BlogLayout } from './components/BlogLayout';

interface BlogPost {
    id: number;
    cover_image_url: string;
    published_at: string;
    author_name: string;
    translation: {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        meta_title: string;
        meta_description: string;
        focus_keyword: string;
    };
}

interface Seo {
    title: string;
    description: string;
    keywords?: string;
    locale?: string;
    canonical?: string;
    ogImage?: string;
    structuredData?: string;
    alternateLocales?: Array<{ locale: string; url: string }>;
}

interface Props {
    post: BlogPost;
    latestPosts?: {
        data: BlogPost[];
    };
    locale: string;
    seo: Seo;
}

export default function Show({ post, latestPosts, locale, seo }: Props) {
    const sidebarPosts =
        latestPosts?.data?.filter((p) => p.id !== post.id).slice(0, 3) || [];

    const [email, setEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubscribing(true);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ email, locale }),
            });

            if (res.ok) {
                toast.success('Successfully subscribed to the newsletter!', {
                    description:
                        "You'll be the first to hear about our updates.",
                });
                setEmail('');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Something went wrong.');
            }
        } catch (error) {
            toast.error('Failed to connect to the server.');
        } finally {
            setSubscribing(false);
        }
    };

    const parsedStructuredData = seo.structuredData
        ? JSON.parse(seo.structuredData)
        : undefined;

    return (
        <BlogLayout locale={locale}>
            <SEOHead
                title={seo.title}
                description={seo.description}
                keywords={seo.keywords}
                locale={seo.locale}
                canonical={seo.canonical}
                ogImage={seo.ogImage}
                ogType="article"
                structuredData={parsedStructuredData}
                alternateLocales={seo.alternateLocales}
            />
            <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
                <Link
                    href={`/${locale}/blog`}
                    className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                </Link>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
                    {/* Main Article */}
                    <article className="lg:col-span-8">
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <h1 className="mb-8 text-4xl leading-tight font-extrabold text-foreground md:text-5xl lg:text-6xl">
                                {post.translation?.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 border-y border-border py-6 text-sm font-medium text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                                        {post.author_name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-foreground">
                                            {post.author_name}
                                        </span>
                                        <span className="text-xs">Author</span>
                                    </div>
                                </div>
                                <div className="hidden h-10 w-px bg-muted sm:block"></div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    <span>
                                        {new Date(
                                            post.published_at,
                                        ).toLocaleDateString(locale, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </motion.header>

                        {post.cover_image_url && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-16 aspect-[2/1] w-full overflow-hidden rounded-3xl border border-border shadow-2xl"
                            >
                                <img
                                    src={post.cover_image_url}
                                    alt={post.translation?.title}
                                    width={1280}
                                    height={640}
                                    className="h-full w-full object-cover"
                                />
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="prose prose-lg max-w-none md:prose-xl prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-foreground prose-h3:text-foreground prose-p:mb-8 prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-700 hover:prose-a:underline prose-blockquote:rounded-r-xl prose-blockquote:border-l-indigo-500 prose-blockquote:bg-muted prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:text-foreground prose-blockquote:not-italic prose-strong:font-semibold prose-strong:text-foreground prose-code:rounded-md prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-indigo-700 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:p-0 prose-ul:text-muted-foreground prose-li:my-2"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                    }: any) {
                                        const match = /language-(\w+)/.exec(
                                            className || '',
                                        );
                                        return !inline && match ? (
                                            <div className="my-8 overflow-hidden rounded-xl border border-border shadow-2xl">
                                                <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    {match[1]}
                                                </div>
                                                <SyntaxHighlighter
                                                    {...props}
                                                    children={String(
                                                        children,
                                                    ).replace(/\n$/, '')}
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: 0,
                                                        padding: '1.5rem',
                                                        background: '#18181b',
                                                        fontSize: '0.9rem',
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <code
                                                {...props}
                                                className={className}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {post.translation?.content}
                            </ReactMarkdown>
                        </motion.div>

                        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-border pt-10 sm:flex-row">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-muted-foreground">
                                    Share this article:
                                </span>
                                <div className="flex gap-2">
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-indigo-500 hover:text-white">
                                        <svg
                                            className="h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                        </svg>
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-blue-600 hover:text-white">
                                        <svg
                                            className="h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-32 space-y-10">
                            {/* Newsletter CTA */}
                            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8">
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    Subscribe to our newsletter
                                </h3>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Get the latest product updates and tutorials
                                    delivered directly to your inbox.
                                </p>
                                <form
                                    className="space-y-3"
                                    onSubmit={handleSubscribe}
                                >
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={subscribing}
                                        placeholder="Your email address"
                                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={subscribing || !email}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {subscribing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Subscribing...
                                            </>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Related Posts */}
                            {sidebarPosts.length > 0 && (
                                <div>
                                    <h3 className="mb-6 text-lg font-bold text-foreground">
                                        Recent Articles
                                    </h3>
                                    <div className="space-y-6">
                                        {sidebarPosts.map((sidebarPost) => (
                                            <Link
                                                key={sidebarPost.id}
                                                href={`/${locale}/blog/${sidebarPost.translation?.slug}`}
                                                className="group flex items-start gap-4"
                                            >
                                                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                                                    {sidebarPost.cover_image_url && (
                                                        <img
                                                            src={
                                                                sidebarPost.cover_image_url
                                                            }
                                                            alt={
                                                                sidebarPost
                                                                    .translation
                                                                    ?.title
                                                            }
                                                            width={96}
                                                            height={80}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-indigo-600">
                                                        {
                                                            sidebarPost
                                                                .translation
                                                                ?.title
                                                        }
                                                    </h4>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {new Date(
                                                            sidebarPost.published_at,
                                                        ).toLocaleDateString(
                                                            locale,
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Call to action for the product */}
                            <div className="rounded-3xl border border-border bg-muted/50 p-8 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">
                                    Extract data from PDFs automatically
                                </h3>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    Docset turns unstructured documents into
                                    JSON ready for your API.
                                </p>
                                <Link
                                    href={`/${locale}/register`}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Start Free Trial
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </BlogLayout>
    );
}
