// Feature: authentication-system, Property 10: UserDropdown displays real user data

/**
 * Validates: Requirements 10.1, 10.2, 10.3
 *
 * For any authenticated user stored in UserContext, the UserDropdown component
 * SHALL render the user's name, the formatted role string, the user's email,
 * and the initials derived from name — and SHALL NOT render hardcoded
 * placeholder values ("Kevin", "Administrator", "kevin@monitoring.op").
 *
 * Minimum 100 runs with fast-check.
 */

import React, { useEffect, useRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, waitFor, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { UserProvider, useUser } from '@/contexts/UserContext';
import UserDropdown from './UserDropdown';

// ── Mock next/navigation ──────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: vi.fn(),
        push: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// ── User interface ────────────────────────────────────────────────────────────

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

// ── MockUserProvider + UserInjector ───────────────────────────────────────────

/**
 * Inner component that calls setUser on mount to inject the user into context.
 * Uses a ref so the injection happens exactly once after the initial render,
 * and is not affected by UserProvider's own cookie-reading useEffect.
 * 
 * To avoid the race condition where UserProvider's useEffect runs *after*
 * UserInjector's useEffect and resets the user to null (when no cookie is
 * present), we use a two-step approach:
 *   1. Render with no cookie so UserProvider initialises to null.
 *   2. After the initial render + effects settle, call setUser(user) explicitly.
 */
function UserInjector({
    user,
    children,
    onReady,
}: {
    user: User | null;
    children: React.ReactNode;
    onReady?: (setUser: (u: User | null) => void) => void;
}) {
    const { setUser } = useUser();
    const readyRef = useRef(false);

    useEffect(() => {
        if (!readyRef.current) {
            readyRef.current = true;
            if (onReady) {
                onReady(setUser);
            } else {
                setUser(user);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}

/**
 * Wrap UserDropdown in the real UserProvider, then inject the test user via
 * UserInjector so we exercise the real context path.
 */
function MockUserProvider({
    user,
    children,
}: {
    user: User | null;
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <UserInjector user={user}>{children}</UserInjector>
        </UserProvider>
    );
}

// ── Helpers (mirrors UserDropdown.tsx logic) ──────────────────────────────────

function formatRole(role: string): string {
    return role
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase())
        .join('');
}

// ── Helpers — build fake JWT ──────────────────────────────────────────────────

function base64urlEncode(input: string): string {
    return btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function buildFakeJwt(payload: Record<string, unknown>): string {
    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64urlEncode(JSON.stringify(payload));
    return `${header}.${body}.fakesignature`;
}

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/`;
}

function clearCookie(name: string) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

/**
 * Multi-word name using capitalized words (e.g. "John Doe").
 * Each word starts with uppercase, followed by 2–8 lowercase letters.
 */
const nameArb = fc
    .array(fc.stringMatching(/^[A-Z][a-z]{2,8}$/), { minLength: 1, maxLength: 3 })
    .map((words) => words.join(' '));

const userArb = fc.record({
    id: fc.stringMatching(/^[a-zA-Z0-9]{1,16}$/),
    name: nameArb,
    email: fc.emailAddress(),
    role: fc.constantFrom('SUPER_ADMIN', 'ADMIN', 'USER', 'MANAGER'),
});

// ── Hardcoded placeholder strings that must NOT appear ────────────────────────

const FORBIDDEN_PLACEHOLDERS = ['Kevin', 'Administrator', 'kevin@monitoring.op'];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UserDropdown PBT', () => {
    afterEach(() => {
        clearCookie('jwt');
        cleanup();
    });

    it(
        'Property 10 — UserDropdown displays real user data',
        async () => {
            /**
             * Validates: Requirements 10.1, 10.2, 10.3
             *
             * For any authenticated user stored in UserContext, the UserDropdown
             * component SHALL render the user's name, the formatted role string,
             * the user's email, and the initials derived from name — and SHALL NOT
             * render hardcoded placeholder values.
             */
            await fc.assert(
                fc.asyncProperty(userArb, async (userData) => {
                    // Set a fake JWT cookie so UserProvider hydrates with the user
                    // instead of setting user to null (no cookie case).
                    // This avoids the race condition where UserProvider's useEffect
                    // overrides the UserInjector's setUser call.
                    clearCookie('jwt');
                    const token = buildFakeJwt({
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        exp: Math.floor(Date.now() / 1000) + 3600,
                    });
                    setCookie('jwt', token);

                    const { unmount } = render(
                        <MockUserProvider user={userData}>
                            <UserDropdown />
                        </MockUserProvider>,
                    );

                    // Wait for all effects to settle (UserProvider hydrates from cookie,
                    // UserInjector also injects the user) and UserDropdown to render.
                    const avatarEl = await waitFor(
                        () => {
                            const el = document.querySelector('[aria-label^="Avatar for"]');
                            if (!el) throw new Error('Avatar not yet rendered');
                            return el;
                        },
                        { timeout: 3000 },
                    );

                    const container = document.body;

                    // 1. The rendered output contains the user's name
                    expect(container.textContent).toContain(userData.name);

                    // 2. The rendered output contains the formatted role
                    const formattedRole = formatRole(userData.role);
                    expect(container.textContent).toContain(formattedRole);

                    // 3. No hardcoded placeholder strings appear
                    for (const placeholder of FORBIDDEN_PLACEHOLDERS) {
                        expect(container.textContent).not.toContain(placeholder);
                    }

                    // 4. Avatar element contains the correct initials
                    const expectedInitials = getInitials(userData.name);
                    expect(avatarEl.textContent).toBe(expectedInitials);

                    // 5. Click the trigger to open the dropdown and check email
                    const triggerBtn = container.querySelector(
                        'button[aria-haspopup="true"]',
                    ) as HTMLButtonElement;
                    expect(triggerBtn).not.toBeNull();
                    fireEvent.click(triggerBtn);

                    // After clicking, the dropdown panel should appear with the email
                    expect(container.textContent).toContain(userData.email);

                    // Cleanup between iterations
                    unmount();
                    cleanup();
                    clearCookie('jwt');
                }),
                { numRuns: 100 },
            );
        },
        60_000, // 60-second timeout — 100 async iterations each require a render cycle
    );
});
