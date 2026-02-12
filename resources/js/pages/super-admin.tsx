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
    Shield, Lock, Eye, EyeOff, CheckCircle2, XCircle
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
    demo_success: number;
    demo_failed: number;
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
        }, { onFinish: () => setSubmitting(false) });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-neutral-800 bg-neutral-950 shadow-2xl">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Super Admin Setup</CardTitle>
                    <CardDescription className="text-neutral-500">
                        Define your admin password. This will be required for all future access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-neutral-400">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="bg-black border-neutral-800 text-white placeholder:text-neutral-600 pr-10 focus:border-neutral-600"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-neutral-400">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Repeat password"
                                className="bg-black border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600"
                                required
                                minLength={6}
                            />
                        </div>
                        {errors?.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        <Button
                            type="submit"
                            disabled={submitting || password.length < 6 || password !== passwordConfirmation}
                            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold"
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
        router.post('/admin-030399/login', { password }, { onFinish: () => setSubmitting(false) });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-neutral-800 bg-neutral-950 shadow-2xl">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Super Admin</CardTitle>
                    <CardDescription className="text-neutral-500">
                        Enter your admin password to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login-password" className="text-neutral-400">Password</Label>
                            <div className="relative">
                                <Input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="bg-black border-neutral-800 text-white placeholder:text-neutral-600 pr-10 focus:border-neutral-600"
                                    required
                                    autoFocus
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        {errors?.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        <Button
                            type="submit"
                            disabled={submitting || !password}
                            className="w-full bg-white text-black hover:bg-neutral-200 font-semibold"
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

    useEffect(() => { fetchUsers(1, ''); }, [fetchUsers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers(1, search);
    };

    const goToPage = (p: number) => { setPage(p); fetchUsers(p, search); };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatSize = (bytes: number | null) => {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Super Admin</h1>
                            <p className="text-xs text-neutral-600">DOCSET Internal</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-neutral-800 text-neutral-500 text-xs font-mono">
                        admin-030399
                    </Badge>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <StatsCard label="Users" value={stats.total_users} icon={<Users className="w-4 h-4" />} />
                    <StatsCard label="Documents" value={stats.total_documents} icon={<FileText className="w-4 h-4" />} />
                    <StatsCard label="Demo Total" value={stats.total_demo_usages} icon={<Zap className="w-4 h-4" />} />
                    <StatsCard label="Demo ✓" value={stats.demo_success} icon={<CheckCircle2 className="w-4 h-4" />} accent="text-emerald-500" />
                    <StatsCard label="Demo ✗" value={stats.demo_failed} icon={<XCircle className="w-4 h-4" />} accent="text-red-500" />
                    <StatsCard label="Stripe" value={stats.users_with_stripe} icon={<CreditCard className="w-4 h-4" />} />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-neutral-900">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                            activeTab === 'users'
                                ? 'text-white border-white'
                                : 'text-neutral-600 border-transparent hover:text-neutral-400'
                        }`}
                    >
                        Users ({stats.total_users})
                    </button>
                    <button
                        onClick={() => setActiveTab('demos')}
                        className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                            activeTab === 'demos'
                                ? 'text-white border-white'
                                : 'text-neutral-600 border-transparent hover:text-neutral-400'
                        }`}
                    >
                        Demo Usage ({stats.total_demo_usages})
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <p className="text-sm text-neutral-500">Click a user for details</p>
                            <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name or email..."
                                        className="pl-9 bg-neutral-950 border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="outline" className="border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900">
                                    Search
                                </Button>
                            </form>
                        </div>

                        {loadingUsers && !users ? (
                            <div className="text-center py-12 text-neutral-600">Loading users...</div>
                        ) : users ? (
                            <>
                                <div className="border border-neutral-900 rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-900 bg-neutral-950 hover:bg-neutral-950">
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Name</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Email</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-center">Docs</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-center">Stripe</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-center">Verified</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Period Usage</TableHead>
                                                <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-right">Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    onClick={() => fetchUserDetail(user.id)}
                                                    className="border-neutral-900/60 cursor-pointer hover:bg-neutral-950 transition"
                                                >
                                                    <TableCell className="text-white font-medium text-sm">{user.name}</TableCell>
                                                    <TableCell className="text-neutral-400 text-sm">{user.email}</TableCell>
                                                    <TableCell className="text-center text-sm text-neutral-300">{user.documents_count}</TableCell>
                                                    <TableCell className="text-center">
                                                        {user.has_stripe
                                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                                            : <XCircle className="w-4 h-4 text-neutral-800 mx-auto" />}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {user.email_verified
                                                            ? <CheckCircle2 className="w-4 h-4 text-blue-500 mx-auto" />
                                                            : <XCircle className="w-4 h-4 text-neutral-800 mx-auto" />}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.usage ? (
                                                            <div className="flex gap-3 text-xs font-mono">
                                                                <span className="text-neutral-500">D:<span className="text-neutral-300">{user.usage.documents_count}</span></span>
                                                                <span className="text-neutral-500">M:<span className="text-neutral-300">{user.usage.models_count}</span></span>
                                                                <span className="text-neutral-500">A:<span className="text-neutral-300">{user.usage.api_requests_count}</span></span>
                                                                <span className="text-neutral-500">R:<span className="text-neutral-300">{user.usage.reports_count}</span></span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-neutral-700 text-xs">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-500 text-sm text-right">{formatDate(user.created_at)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {users.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-sm text-neutral-600">
                                            Page {users.current_page}/{users.last_page} · {users.total} users
                                        </span>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" disabled={users.current_page <= 1} onClick={() => goToPage(users.current_page - 1)} className="border-neutral-800 text-neutral-400 hover:bg-neutral-900">
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" disabled={users.current_page >= users.last_page} onClick={() => goToPage(users.current_page + 1)} className="border-neutral-800 text-neutral-400 hover:bg-neutral-900">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* Demos Tab */}
                {activeTab === 'demos' && (
                    <div className="space-y-6">
                        {/* Success/Failed summary */}
                        <div className="flex gap-4 text-sm">
                            <span className="text-neutral-500">Total: <span className="text-white font-semibold">{stats.total_demo_usages}</span></span>
                            <span className="text-neutral-500">Success: <span className="text-emerald-500 font-semibold">{stats.demo_success}</span></span>
                            <span className="text-neutral-500">Failed: <span className="text-red-500 font-semibold">{stats.demo_failed}</span></span>
                        </div>

                        {/* Mini chart — Demo usage per day */}
                        {stats.demo_per_day.length > 0 && (
                            <div>
                                <h3 className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Last 30 days</h3>
                                <div className="flex items-end gap-[2px] h-20">
                                    {stats.demo_per_day.map((d) => {
                                        const max = Math.max(...stats.demo_per_day.map(x => x.count));
                                        const pct = max > 0 ? (d.count / max) * 100 : 0;
                                        return (
                                            <div
                                                key={d.date}
                                                className="flex-1 bg-white/10 hover:bg-white/25 rounded-sm transition-all group relative"
                                                style={{ height: `${Math.max(pct, 4)}%` }}
                                                title={`${d.date}: ${d.count}`}
                                            >
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                                                    {d.date}: {d.count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recent demos table */}
                        <div className="border border-neutral-900 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-neutral-900 bg-neutral-950 hover:bg-neutral-950">
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">IP</TableHead>
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Filename</TableHead>
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Type</TableHead>
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-right">Size</TableHead>
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-center">Status</TableHead>
                                        <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recent_demos.length === 0 ? (
                                        <TableRow className="border-neutral-900/60">
                                            <TableCell colSpan={6} className="text-center text-neutral-700 py-8">
                                                No demo usages recorded yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.recent_demos.map((demo) => (
                                            <TableRow key={demo.id} className="border-neutral-900/60 hover:bg-neutral-950">
                                                <TableCell className="text-neutral-400 font-mono text-sm">{demo.ip_address}</TableCell>
                                                <TableCell className="text-white text-sm max-w-[200px] truncate">{demo.filename || '-'}</TableCell>
                                                <TableCell className="text-neutral-400 text-sm">{demo.mime_type?.split('/')[1] || '-'}</TableCell>
                                                <TableCell className="text-neutral-500 text-sm text-right">{formatSize(demo.file_size)}</TableCell>
                                                <TableCell className="text-center">
                                                    {demo.success
                                                        ? <span className="text-emerald-500 text-xs font-medium">OK</span>
                                                        : <span className="text-red-500 text-xs font-medium">FAIL</span>}
                                                </TableCell>
                                                <TableCell className="text-neutral-500 text-sm text-right">{formatDateTime(demo.created_at)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </main>

            {/* User Detail Modal */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="max-w-2xl bg-neutral-950 border-neutral-800 text-white max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">User Details</DialogTitle>
                        <DialogDescription className="text-neutral-500">
                            Full information and usage history
                        </DialogDescription>
                    </DialogHeader>

                    {loadingDetail ? (
                        <div className="py-12 text-center text-neutral-600">Loading...</div>
                    ) : selectedUser ? (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoItem label="Name" value={selectedUser.name} />
                                <InfoItem label="Email" value={selectedUser.email} />
                                <InfoItem label="Joined" value={formatDateTime(selectedUser.created_at)} />
                                <InfoItem label="Email Verified" value={selectedUser.email_verified ? 'Yes' : 'No'} />
                                <InfoItem label="Stripe ID" value={selectedUser.stripe_id || 'None'} />
                                <InfoItem label="Total Documents" value={String(selectedUser.documents_count)} />
                            </div>

                            {selectedUser.subscription && (
                                <div className="border border-neutral-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Subscription</h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <InfoItem label="Stripe Sub ID" value={selectedUser.subscription.stripe_id} small />
                                        <InfoItem label="Status" value={selectedUser.subscription.stripe_status} small />
                                        <InfoItem label="Created" value={formatDate(selectedUser.subscription.created_at)} small />
                                    </div>
                                </div>
                            )}

                            {selectedUser.usage_history.length > 0 && (
                                <div className="border border-neutral-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Usage History</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                                <TableHead className="text-neutral-500 text-xs">Period</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-center">Docs</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-center">Models</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-center">API</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-center">Reports</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedUser.usage_history.map((u, i) => (
                                                <TableRow key={i} className="border-neutral-800/60">
                                                    <TableCell className="text-white text-sm font-mono">{u.billing_period}</TableCell>
                                                    <TableCell className="text-center text-sm text-neutral-400">{u.documents_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-neutral-400">{u.models_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-neutral-400">{u.api_requests_count}</TableCell>
                                                    <TableCell className="text-center text-sm text-neutral-400">{u.reports_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {selectedUser.recent_documents.length > 0 && (
                                <div className="border border-neutral-800 rounded-lg p-3 space-y-2">
                                    <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Recent Documents</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                                <TableHead className="text-neutral-500 text-xs">Name</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-center">Status</TableHead>
                                                <TableHead className="text-neutral-500 text-xs text-right">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedUser.recent_documents.map((doc) => (
                                                <TableRow key={doc.id} className="border-neutral-800/60">
                                                    <TableCell className="text-white text-sm max-w-[250px] truncate">{doc.original_filename || doc.name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`text-xs font-medium ${
                                                            doc.status === 'completed' ? 'text-emerald-500' :
                                                            doc.status === 'failed' ? 'text-red-500' :
                                                            'text-neutral-500'
                                                        }`}>
                                                            {doc.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-500 text-sm text-right">{formatDate(doc.created_at)}</TableCell>
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

function StatsCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
    return (
        <div className="border border-neutral-900 rounded-lg p-4 bg-neutral-950">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${accent || 'text-white'}`}>{value.toLocaleString()}</p>
                </div>
                <div className="text-neutral-700">{icon}</div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, small }: { label: string; value: string; small?: boolean }) {
    return (
        <div>
            <p className={`text-neutral-600 ${small ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider`}>{label}</p>
            <p className={`text-neutral-300 ${small ? 'text-xs' : 'text-sm'} break-all`}>{value}</p>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────

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
