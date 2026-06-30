'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { decodeJwt } from 'jose';
import { useRouter } from 'next/navigation';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface UserContextValue {
    user: User | null;
    loading: boolean;          // true while hydrating from cookie on first mount
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextValue | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse and decode the `jwt` cookie from document.cookie, or return null. */
function readUserFromCookie(): User | null {
    try {
        const jwtCookie = document.cookie
            .split(';')
            .map((c) => c.trim())
            .find((c) => c.startsWith('jwt='));

        if (!jwtCookie) return null;

        const token = jwtCookie.slice('jwt='.length);
        if (!token) return null;

        const payload = decodeJwt(token);

        const id = typeof payload.id === 'string' ? payload.id : '';
        const name = typeof payload.name === 'string' ? payload.name : '';
        const email = typeof payload.email === 'string' ? payload.email : '';
        const role = typeof payload.role === 'string' ? payload.role : '';

        if (process.env.NODE_ENV === 'development') {
            console.log('[UserContext] Decoded JWT:', { id, email, role });
        }

        return { id, name, email, role };
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('[UserContext] Hydration failed:', err);
        }
        return null;
    }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
    // loading=true until the first cookie-hydration attempt is done.
    // Components that depend on auth (DashboardLayout) must wait for loading=false
    // before making redirect decisions, to avoid a false-negative when user is
    // actually authenticated but context hasn't hydrated yet.
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // Hydrate from the jwt cookie exactly once on mount.
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[UserContext] Hydrating from cookie...');
        }
        const hydratedUser = readUserFromCookie();
        setUserState(hydratedUser);
        setLoading(false);
        if (process.env.NODE_ENV === 'development') {
            if (hydratedUser) {
                console.log('[UserContext] Authenticated user:', hydratedUser.email);
            } else {
                console.log('[UserContext] No cookie found — user is unauthenticated.');
            }
        }
    }, []);

    const setUser = useCallback((u: User | null) => {
        setUserState(u);
    }, []);

    // Logout: clear cookie server-side, wipe context, redirect to login.
    const logout = useCallback(async () => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[UserContext] Logging out...');
        }
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Swallow network errors — still clear local state.
        }
        setUserState(null);
        router.replace('/login');
    }, [router]);

    return (
        <UserContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (ctx === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return ctx;
}
