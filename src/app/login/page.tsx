'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertTriangle, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormErrors {
    email?: string;
    password?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getApiUrl(): string | null {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    if (!raw || raw.trim() === '') return null;
    return raw.replace(/\/+$/, '');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, setUser } = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState('');
    const [backendOffline, setBackendOffline] = useState(false);

    // ── Redirect guard ────────────────────────────────────────────────────────
    // Wait for UserContext to finish hydrating, then redirect to /admin if
    // the user is already authenticated. This prevents flickering the login
    // form to a user who is already logged in.
    useEffect(() => {
        if (loading) return;   // don't act until hydration is complete
        if (user) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[LoginPage] Already authenticated — redirecting to /admin');
            }
            router.replace('/admin');
        }
    }, [loading, user, router]);

    // ── Backend health check ──────────────────────────────────────────────────
    useEffect(() => {
        const apiUrl = getApiUrl();
        if (!apiUrl) return;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(`${apiUrl}/health`, { signal: controller.signal })
            .then((res) => setBackendOffline(!res.ok))
            .catch(() => setBackendOffline(true))
            .finally(() => clearTimeout(timeout));

        return () => { clearTimeout(timeout); controller.abort(); };
    }, []);

    // ── Submit ────────────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // 1. Client-side validation — never dispatch network on blank fields
        const newErrors: FormErrors = {};
        if (!email.trim()) newErrors.email = 'Email tidak boleh kosong';
        if (!password.trim()) newErrors.password = 'Password tidak boleh kosong';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2. Ensure API URL is configured
        const apiUrl = getApiUrl();
        if (!apiUrl) {
            setServerError('NEXT_PUBLIC_API_URL is not configured. Buat file .env.local.');
            return;
        }

        setErrors({});
        setServerError('');
        setSubmitting(true);

        if (process.env.NODE_ENV === 'development') {
            console.log('[Login] Submitting to:', `${apiUrl}/auth/login`);
        }

        try {
            // 3. POST credentials to Go backend
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();

                if (process.env.NODE_ENV === 'development') {
                    console.log('[Login] Login Success — token received');
                }

                // 4. Store JWT as HttpOnly cookie via Next.js API route
                const cookieRes = await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: data.data.token }),
                });

                if (!cookieRes.ok) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('[Login] set-cookie failed:', cookieRes.status);
                    }
                    setServerError('Gagal menyimpan sesi. Coba lagi.');
                    setSubmitting(false);
                    return;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('[Login] Cookie stored — populating UserContext');
                }

                // 5. Populate UserContext with the user object from the login response.
                //    This makes the user available immediately without waiting for a
                //    full cookie re-hydration on the next render.
                setUser(data.data.user);

                if (process.env.NODE_ENV === 'development') {
                    console.log('[Login] Redirecting to /admin');
                }

                // 6. Navigate to dashboard
                router.replace('/admin');
                return;
            }

            // Per-status error messages
            if (res.status === 401) {
                setServerError('Email atau Password salah.');
            } else if (res.status === 400) {
                setServerError('Request tidak valid. Periksa kembali form.');
            } else if (res.status === 404) {
                setServerError('Endpoint tidak ditemukan. Periksa konfigurasi NEXT_PUBLIC_API_URL.');
            } else if (res.status >= 500) {
                setServerError('Server sedang mengalami gangguan. Coba lagi nanti.');
            } else {
                let msg = 'Terjadi kesalahan. Coba lagi.';
                try { const d = await res.json(); msg = d?.message ?? msg; } catch { /* ignore */ }
                setServerError(msg);
            }
        } catch {
            setServerError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
        } finally {
            setSubmitting(false);
        }
    }

    // While UserContext is still hydrating, show nothing (or a minimal spinner)
    // to avoid a flash of the login form for already-authenticated users.
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-gray-100">

            {/* LEFT */}
            <section className="flex items-center justify-center bg-white px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-14">
                        <img src="#" alt="logo" className="w-12 h-12 rounded-xl" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-5xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-4 text-gray-500 leading-7">
                        Sign in to access the Operational Monitoring Dashboard.
                    </p>

                    {/* Backend offline banner */}
                    {backendOffline && (
                        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                            <WifiOff size={16} className="mt-0.5 shrink-0" />
                            <span>
                                Backend Authentication sedang offline. Pastikan server Go berjalan di{' '}
                                <code className="font-mono text-xs">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}</code>.
                            </span>
                        </div>
                    )}

                    {/* Server error */}
                    {serverError && (
                        <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative mt-2">
                                <User size={20} className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                                    }}
                                    placeholder="Enter email"
                                    autoComplete="email"
                                    className={`w-full h-14 pl-12 pr-4 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none transition ${errors.email ? 'border-red-400' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative mt-2">
                                <Lock size={20} className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                    }}
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                    className={`h-14 w-full rounded-2xl border bg-gray-50 pl-12 pr-12 outline-none transition focus:ring-2 focus:ring-red-500 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-red-500'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember me + Forgot password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-red-600" />
                                Remember me
                            </label>
                            <Link
                                href="/forgot-password"
                                className="font-medium text-red-600 hover:text-red-700 hover:underline transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 rounded-2xl bg-red-700 hover:bg-red-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold shadow-lg flex items-center justify-center gap-2 transition"
                        >
                            {submitting ? (
                                <>
                                    <span className="inline-block w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </motion.button>

                    </form>

                    <p className="mt-16 text-center text-sm text-gray-400">© 2026 Monitoring OP</p>

                </motion.div>
            </section>

            {/* RIGHT — decorative panel */}
            <section
                className="hidden lg:flex relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-black/25" />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-16 left-16 right-16"
                >
                    <div className="rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 p-10 text-white">
                        <span className="inline-block w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin mb-6" />
                        <h2 className="text-4xl font-bold leading-tight">
                            Operational Monitoring<br />Dashboard
                        </h2>
                        <p className="mt-5 text-white/80 leading-8">
                            Monitor operational activities, performance, and system status
                            in one centralized dashboard with real-time updates.
                        </p>
                        <div className="mt-8 flex gap-8">
                            <div>
                                <p className="text-3xl font-bold">99.9%</p>
                                <span className="text-sm text-white/70">Uptime</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">24/7</p>
                                <span className="text-sm text-white/70">Monitoring</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">Live</p>
                                <span className="text-sm text-white/70">Status</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

        </main>
    );
}
