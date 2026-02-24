import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
    };
}

interface Props {
    posts: {
        data: BlogPost[];
        links: any[];
    };
    locale: string;
}

export default function Index({ posts, locale }: Props) {
    const featuredPost = posts.data[0];
    const regularPosts = posts.data.slice(1);

    return (
        <BlogLayout locale={locale}>
            <Head>
                <title>Blog - Docset</title>
                <meta
                    name="description"
                    content="Insights, product updates, and tutorials about data extraction."
                />
            </Head>

            <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
                <div className="mb-16 text-center lg:mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
                    >
                        Docset{' '}
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Journal
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400"
                    >
                        Insights, product updates, and expert tips on how to
                        automate your document processing workflows.
                    </motion.p>
                </div>

                {featuredPost && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-16 lg:mb-24"
                    >
                        <Link
                            href={`/${locale}/blog/${featuredPost.translation?.slug}`}
                            className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 shadow-2xl transition-all hover:border-white/20 hover:bg-zinc-900 lg:grid-cols-2"
                        >
                            <div className="relative aspect-[16/9] lg:aspect-auto">
                                {featuredPost.cover_image_url ? (
                                    <img
                                        src={featuredPost.cover_image_url}
                                        alt={featuredPost.translation?.title}
                                        width={1280}
                                        height={720}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                                )}
                            </div>
                            <div className="flex flex-col justify-center p-8 lg:p-16">
                                <div className="mb-6 flex items-center gap-4 text-sm font-medium text-zinc-400">
                                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-400">
                                        Featured
                                    </span>
                                    <span>
                                        {new Date(
                                            featuredPost.published_at,
                                        ).toLocaleDateString(locale, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <h2 className="mb-4 text-3xl font-bold text-white transition-colors group-hover:text-indigo-400 sm:text-4xl">
                                    {featuredPost.translation?.title}
                                </h2>
                                <p className="mb-8 line-clamp-3 text-lg text-zinc-400">
                                    {featuredPost.translation?.excerpt}
                                </p>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-800 font-bold text-zinc-400">
                                            {featuredPost.author_name.charAt(0)}
                                        </div>
                                        <div className="text-sm font-medium text-white">
                                            {featuredPost.author_name}
                                        </div>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors group-hover:bg-white/10 group-hover:text-indigo-400">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    {regularPosts.map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <Link
                                href={`/${locale}/blog/${post.translation?.slug}`}
                                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30 transition-all hover:border-white/10 hover:bg-zinc-900/50 hover:shadow-xl"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    {post.cover_image_url ? (
                                        <img
                                            src={post.cover_image_url}
                                            alt={post.translation?.title}
                                            width={600}
                                            height={400}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-4 flex items-center gap-2 text-xs font-medium text-zinc-500">
                                        <span>
                                            {new Date(
                                                post.published_at,
                                            ).toLocaleDateString(locale, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-indigo-400">
                                        {post.translation?.title}
                                    </h2>
                                    <p className="mb-6 line-clamp-3 text-sm text-zinc-400">
                                        {post.translation?.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="text-sm font-medium text-zinc-300">
                                            {post.author_name}
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-indigo-400" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {posts.data.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-zinc-500">
                        No articles published yet. Check back soon.
                    </div>
                )}
            </div>
        </BlogLayout>
    );
}
