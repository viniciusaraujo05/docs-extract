import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Users, FileText, Zap, CreditCard, Search, ChevronLeft, ChevronRight,
    Shield, Lock, Eye, EyeOff, X, CheckCircle2, XCircle, ArrowLeft
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────

interface UserUsage {
    billing_period: string;
    documents_count: number;
    models_count: number;
    api_requests_count: number;
    reports_count: number;
    period_start: string | null;
    period_end: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified: boolean;
    has_stripe: boolean;
    stripe_id: string | null;
    documents_count: number;
    usage: UserUsage | null;
}

interface UserDetail extends UserRow {
    subscription: {
        stripe_id: string;
        stripe_status: string;
        created_at: string;
    } | null;
    usage_history: UserUsage[];
    recent_documents: Array<{
        id: number;
        name: string;
        original_filename: string;
        status: string;
        created_at: string;
        mime_type: string;
        file_size: number;
    }>;
}

interface DemoUsageRow {
    id: number;
    ip_address: string;
    filename: string | null;
    mime_type: string | null;
    file_size: number | null;
    success: boolean;
    created_at: string;
}

interface DemoPerDay {
    date: string;
    count: number;
}

interface DashboardStats {
    total_users: number;
    total_documents: number;
    total_demo_usages: number;
    users_with_stripe: number;
    recent_demos: DemoUsageRow[];
    demo_per_day: DemoPerDay[];
}

interface PaginatedUsers {
    data: UserRow[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface PageProps {
    mode: 'setup' | 'login' | 'dashboard';
    stats?: DashboardStats;
    errors?: Record<string, string>;
}

// ─── Setup Mode ───────────────────────────────────────────────────

function SetupView() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { errors } = usePage<PageProps>().props;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/admin-030399/setup', {
            password,
            password_confirmation: passwordConfirmation,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Super Admin Setup</CardTitle>
                    <CardDescription className="text-slate-400">
                        Define your admin password. This will be required for all future access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="bg-slate-800/50 border-slate-700 text-white pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-slate-300">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Repeat password"
                                className="bg-slate-800/50 border-slate-700 text-white"
                                required
                                minLength={6}
                            />
                        </div>
                        {errors?.password && (
                            <p className="text-red-400 text-sm">{errors.password}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={submitting || password.length < 6 || password !== passwordConfirmation}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            {submitting ? 'Setting up...' : 'Set Password & Enter'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Login Mode ───────────────────────────────────────────────────

function LoginView() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { errors } = usePage<PageProps>().props;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/admin-030399/login', { password }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Super Admin</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your admin password to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="bg-slate-800/50 border-slate-700 text-white pr-10"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        {errors?.password && (
                            <p className="text-red-400 text-sm">{errors.password}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={submitting || !password}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            {submitting ? 'Verifying...' : 'Enter'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Dashboard Mode ───────────────────────────────────────────────

function DashboardView({ stats }: { stats: DashboardStats }) {
    const [users, setUsers] = useState<PaginatedUsers | null>(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'demos'>('users');

    const csrf = typeof document !== 'undefined'
        ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
        : '';

    const fetchUsers = useCallback(async (pageNum: number, searchTerm: string) => {
        setLoadingUsers(true);
        try {
            const params = new URLSearchParams({ page: String(pageNum) });
            if (searchTerm) params.set('search', searchTerm);
            const res = await fetch(`/admin-030399/api/users?${params}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error('Failed to fetch users', e);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const fetchUserDetail = useCallback(async (id: number) => {
        setLoadingDetail(true);
        setShowUserModal(true);
        try {
            const res = await fetch(`/admin-030399/api/users/${id}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) setSelectedUser(await res.json());
        } catch (e) {
            console.error('Failed to fetch user detail', e);
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(1, '');
    }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers(1, search);
    };

    const goToPage = (p: number) => {
        setPage(p);
        fetchUsers(p, search);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatSize = (bytes: number | null) => {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Super Admin</h1>
                            <p className="text-xs text-slate-500">DOCSET Internal Dashboard</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-violet-600/40 text-violet-300 text-xs">
                        admin-030399
                    </Badge>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Users"
                        value={stats.total_users}
                        icon={<Users className="w-5 h-5" />}
                        gradient="from-blue-600 to-cyan-600"
                    />
                    <StatsCard
                        label="Total Documents"
                        value={stats.total_documents}
                        icon={<FileText className="w-5 h-5" />}
                        gradient="from-emerald-600 to-teal-600"
                    />
                    <StatsCard
                        label="Demo Usages"
                        value={stats.total_demo_usages}
                        icon={<Zap className="w-5 h-5" />}
                        gradient="from-amber-600 to-orange-600"
                    />
                    <StatsCard
                        label="Stripe Users"
                        value={stats.users_with_stripe}
                        icon={<CreditCard className="w-5 h-5" />}
                        gradient="from-violet-600 to-purple-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-0">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                            activeTab === 'users'
                                ? 'bg-slate-800/80 text-white border border-slate-700 border-b-transparent -mb-px'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Users ({stats.total_users})
                    </button>
                    <button
                        onClick={() => setActiveTab('demos')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                            activeTab === 'demos'
                                ? 'bg-slate-800/80 text-white border border-slate-700 border-b-transparent -mb-px'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Zap className="w-4 h-4 inline mr-2" />
                        Demo Usage ({stats.total_demo_usages})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'users' && (
                    <Card className="border-slate-800 bg-slate-900/60">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-white">All Users</CardTitle>
                                    <CardDescription className="text-slate-400">Click a user row for details</CardDescription>
                                </div>
                                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="pl-9 bg-slate-800/50 border-slate-700 text-white text-sm"
                                        />
                                    </div>
                                    <Button type="submit" size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                                        Search
                                    </Button>
                                </form>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingUsers && !users ? (
                                <div className="text-center py-12 text-slate-400">Loading users...</div>
                            ) : users ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-800 hover:bg-transparent">
                                                    <TableHead className="text-slate-400">Name</TableHead>
                                                    <TableHead className="text-slate-400">Email</TableHead>
                                                    <TableHead className="text-slate-400 text-center">Docs</TableHead>
                                                    <TableHead className="text-slate-400 text-center">Stripe</TableHead>
                                                    <TableHead className="text-slate-400 text-center">Verified</TableHead>
                                                    <TableHead className="text-slate-400">Period Usage</TableHead>
                                                    <TableHead className="text-slate-400 text-right">Joined</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.data.map((user) => (
                                                    <TableRow
                                                        key={user.id}
                                                        onClick={() => fetchUserDetail(user.id)}
                                                        className="border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition"
                                                    >
                                                        <TableCell className="text-white font-medium">{user.name}</TableCell>
                                                        <TableCell className="text-slate-300 text-sm">{user.email}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                                                {user.documents_count}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {user.has_stripe ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {user.email_verified ? (
                                                                <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.usage ? (
                                                                <div className="flex gap-2 text-xs">
                                                                    <span className="text-slate-400">D:{user.usage.documents_count}</span>
                                                                    <span className="text-slate-400">M:{user.usage.models_count}</span>
                                                                    <span className="text-slate-400">A:{user.usage.api_requests_count}</span>
                                                                    <span className="text-slate-400">R:{user.usage.reports_count}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-600 text-xs">No usage</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-slate-400 text-sm text-right">{formatDate(user.created_at)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {users.last_page > 1 && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                                            <span className="text-sm text-slate-400">
                                                Page {users.current_page} of {users.last_page} ({users.total} users)
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={users.current_page <= 1}
                                                    onClick={() => goToPage(users.current_page - 1)}
                                                    className="border-slate-700 text-slate-300"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={users.current_page >= users.last_page}
                                                    onClick={() => goToPage(users.current_page + 1)}
                                                    className="border-slate-700 text-slate-300"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'demos' && (
                    <Card className="border-slate-800 bg-slate-900/60">
                        <CardHeader>
                            <CardTitle className="text-white">Demo Extraction Usage</CardTitle>
                            <CardDescription className="text-slate-400">
                                Every time someone uses the landing page demo, it's recorded here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mini chart — Demo usage per day (last 30 days) */}
                            {stats.demo_per_day.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-300 mb-3">Last 30 days</h3>
                                    <div className="flex items-end gap-[3px] h-24">
                                        {stats.demo_per_day.map((d) => {
                                            const max = Math.max(...stats.demo_per_day.map(x => x.count));
                                            const pct = max > 0 ? (d.count / max) * 100 : 0;
                                            return (
                                                <div
                                                    key={d.date}
                                                    className="flex-1 bg-gradient-to-t from-amber-600/60 to-amber-400/60 rounded-t hover:from-amber-500 hover:to-amber-300 transition-all group relative"
                                                    style={{ height: `${Math.max(pct, 4)}%` }}
                                                    title={`${d.date}: ${d.count} usages`}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                                        {d.date}: {d.count}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recent demos table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800 hover:bg-transparent">
                                            <TableHead className="text-slate-400">IP</TableHead>
                                            <TableHead className="text-slate-400">Filename</TableHead>
                                            <TableHead className="text-slate-400">Type</TableHead>
                                            <TableHead className="text-slate-400 text-right">Size</TableHead>
                                            <TableHead className="text-slate-400 text-center">Success</TableHead>
                                            <TableHead className="text-slate-400 text-right">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stats.recent_demos.length === 0 ? (
                                            <TableRow className="border-slate-800/60">
                                                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                                    No demo usages recorded yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            stats.recent_demos.map((demo) => (
                                                <TableRow key={demo.id} className="border-slate-800/60">
                                                    <TableCell className="text-slate-300 font-mono text-sm">{demo.ip_address}</TableCell>
                                                    <TableCell className="text-white text-sm max-w-[200px] truncate">{demo.filename || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                                                            {demo.mime_type?.split('/')[1] || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 text-sm text-right">{formatSize(demo.file_size)}</TableCell>
                                                    <TableCell className="text-center">
                                                        {demo.success ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 text-sm text-right">{formatDateTime(demo.created_at)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* User Detail Modal */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">User Details</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Full information and usage history
                        </DialogDescription>
                    </DialogHeader>

                    {loadingDetail ? (
                        <div className="py-12 text-center text-slate-400">Loading user details...</div>
                    ) : selectedUser ? (
                        <div className="space-y-5">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <InfoItem label="Name" value={selectedUser.name} />
                                <InfoItem label="Email" value={selectedUser.email} />
                                <InfoItem label="Joined" value={formatDateTime(selectedUser.created_at)} />
                                <InfoItem label="Email Verified" value={selectedUser.email_verified ? 'Yes' : 'No'} />
                                <InfoItem label="Stripe ID" value={selectedUser.stripe_id || 'None'} />
                                <InfoItem label="Total Documents" value={String(selectedUser.documents_count)} />
                            </div>

                            {/* Subscription */}
                            {selectedUser.subscription && (
                                <div className="border border-slate-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-sm font-semibold text-violet-400">Subscription</h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <InfoItem label="Stripe Sub ID" value={selectedUser.subscription.stripe_id} small />
                                        <InfoItem label="Status" value={selectedUser.subscription.stripe_status} small />
                                        <InfoItem label="Created" value={formatDate(selectedUser.subscription.created_at)} small />
                                    </div>
                                </div>
                            )}

                            {/* Usage History */}
                            {selectedUser.usage_history.length > 0 && (
                                <div className="border border-slate-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-sm font-semibold text-emerald-400">Usage History</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-800 hover:bg-transparent">
                                                <TableHead className="text-slate-400 text-xs">Period</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-center">Docs</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-center">Models</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-center">API</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-center">Reports</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedUser.usage_history.map((u, i) => (
                                                <TableRow key={i} className="border-slate-800/60">
                                                    <TableCell className="text-white text-sm">{u.billing_period}</TableCell>
                                                    <TableCell className="text-center text-sm text-slate-300">{u.documents_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-slate-300">{u.models_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-slate-300">{u.api_requests_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-slate-300">{u.reports_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Recent Documents */}
                            {selectedUser.recent_documents.length > 0 && (
                                <div className="border border-slate-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-sm font-semibold text-blue-400">Recent Documents (last 10)</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-800 hover:bg-transparent">
                                                <TableHead className="text-slate-400 text-xs">Name</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-center">Status</TableHead>
                                                <TableHead className="text-slate-400 text-xs text-right">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedUser.recent_documents.map((doc) => (
                                                <TableRow key={doc.id} className="border-slate-800/60">
                                                    <TableCell className="text-white text-sm max-w-[250px] truncate">{doc.original_filename || doc.name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className={`text-xs ${
                                                            doc.status === 'completed' ? 'bg-emerald-900/30 text-emerald-400' :
                                                            doc.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                                                            'bg-slate-800 text-slate-300'
                                                        }`}>
                                                            {doc.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 text-sm text-right">{formatDate(doc.created_at)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Helper Components ────────────────────────────────────────────

function StatsCard({ label, value, icon, gradient }: { label: string; value: number; icon: React.ReactNode; gradient: string }) {
    return (
        <Card className="border-slate-800 bg-slate-900/60 overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">{label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoItem({ label, value, small }: { label: string; value: string; small?: boolean }) {
    return (
        <div>
            <p className={`text-slate-500 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
            <p className={`text-slate-200 ${small ? 'text-xs' : 'text-sm'} break-all`}>{value}</p>
        </div>
    );
}

// ─── Main Page Component ──────────────────────────────────────────

export default function SuperAdmin() {
    const { mode, stats } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Super Admin" />
            {mode === 'setup' && <SetupView />}
            {mode === 'login' && <LoginView />}
            {mode === 'dashboard' && stats && <DashboardView stats={stats} />}
        </>
    );
}
