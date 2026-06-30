// Feature: authentication-system, Property 8: UserContext hydrates correctly from JWT cookie
// Feature: authentication-system, Property 9: Logout clears all auth state

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { UserProvider, useUser } from './UserContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Encode a value as base64url (no padding, URL-safe characters).
 * Works in jsdom (browser-like) environment via btoa.
 */
function base64urlEncode(input: string): string {
    return btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Build a fake JWT token containing the given payload.
 * The header and signature are fixed/fake — decodeJwt (jose) only decodes the
 * payload and does NOT verify the signature, so this is sufficient.
 */
function buildFakeJwt(payload: Record<string, unknown>): string {
    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64urlEncode(JSON.stringify(payload));
    const signature = 'fakesignature';
    return `${header}.${body}.${signature}`;
}

/** Clears document.cookie for the given key */
function clearCookie(name: string) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
}

/** Sets a cookie in jsdom */
function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/`;
}

// ── Test consumer component ───────────────────────────────────────────────────

function TestConsumer() {
    const { user, logout } = useUser();
    return (
        <div>
            <span data-testid="user-id">{user?.id ?? '__null__'}</span>
            <span data-testid="user-email">{user?.email ?? '__null__'}</span>
            <span data-testid="user-role">{user?.role ?? '__null__'}</span>
            <span data-testid="user-name">{user?.name ?? '__null__'}</span>
            <button data-testid="logout-btn" onClick={() => void logout()}>
                Logout
            </button>
        </div>
    );
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

/**
 * Generates non-empty alphanumeric strings safe for use inside JWT JSON.
 * Avoids characters that could break base64url or JSON encoding.
 */
const safeStringArb = fc.stringMatching(/^[a-zA-Z0-9]{1,32}$/);

const userArb = fc.record({
    id: safeStringArb,
    email: fc.emailAddress(),
    role: safeStringArb,
    name: safeStringArb,
});

// ── Mock for next/navigation ──────────────────────────────────────────────────

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UserContext PBT', () => {
    beforeEach(() => {
        clearCookie('jwt');
        mockReplace.mockClear();
    });

    afterEach(() => {
        clearCookie('jwt');
        vi.restoreAllMocks();
    });

    // ── Property 8 ────────────────────────────────────────────────────────────

    it('Property 8 — UserContext hydrates correctly from JWT cookie', async () => {
        /**
         * Validates: Requirements 8.3
         *
         * For any valid JWT cookie present in the browser, the UserProvider on
         * mount SHALL populate user.id, user.email, user.role, and user.name
         * with the exact values decoded from the JWT payload.
         */
        await fc.assert(
            fc.asyncProperty(userArb, async (userData) => {
                // Arrange: build a fake JWT and set the cookie
                clearCookie('jwt');
                const token = buildFakeJwt({
                    id: userData.id,
                    email: userData.email,
                    role: userData.role,
                    name: userData.name,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                });
                setCookie('jwt', token);

                // Act: render UserProvider
                const { unmount } = render(
                    <UserProvider>
                        <TestConsumer />
                    </UserProvider>,
                );

                // Assert: fields match the generated values
                await waitFor(() => {
                    expect(screen.getByTestId('user-id').textContent).toBe(userData.id);
                    expect(screen.getByTestId('user-email').textContent).toBe(userData.email);
                    expect(screen.getByTestId('user-role').textContent).toBe(userData.role);
                    expect(screen.getByTestId('user-name').textContent).toBe(userData.name);
                });

                // Cleanup
                unmount();
                clearCookie('jwt');
            }),
            { numRuns: 100 },
        );
    });

    // ── Property 9 ────────────────────────────────────────────────────────────

    it('Property 9 — Logout clears all auth state', async () => {
        /**
         * Validates: Requirements 8.4, 9.1
         *
         * For any authenticated session, calling logout() SHALL result in:
         *   - fetch called with /api/auth/logout
         *   - UserContext.user becomes null
         *   - router.replace('/login') is called
         */
        await fc.assert(
            fc.asyncProperty(userArb, async (userData) => {
                // Arrange: mock fetch to succeed
                const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
                    new Response(null, { status: 200, statusText: 'OK' }),
                );
                mockReplace.mockClear();

                // Arrange: pre-populate cookie so UserProvider hydrates user
                clearCookie('jwt');
                const token = buildFakeJwt({
                    id: userData.id,
                    email: userData.email,
                    role: userData.role,
                    name: userData.name,
                    exp: Math.floor(Date.now() / 1000) + 3600,
                });
                setCookie('jwt', token);

                const { unmount } = render(
                    <UserProvider>
                        <TestConsumer />
                    </UserProvider>,
                );

                // Wait for hydration
                await waitFor(() => {
                    expect(screen.getByTestId('user-id').textContent).toBe(userData.id);
                });

                // Act: click logout button
                await act(async () => {
                    screen.getByTestId('logout-btn').click();
                });

                // Assert: user becomes null
                await waitFor(() => {
                    expect(screen.getByTestId('user-id').textContent).toBe('__null__');
                    expect(screen.getByTestId('user-email').textContent).toBe('__null__');
                    expect(screen.getByTestId('user-role').textContent).toBe('__null__');
                    expect(screen.getByTestId('user-name').textContent).toBe('__null__');
                });

                // Assert: fetch was called with the logout endpoint
                expect(fetchSpy).toHaveBeenCalledWith(
                    '/api/auth/logout',
                    expect.objectContaining({ method: 'POST' }),
                );

                // Assert: router.replace('/login') was called
                expect(mockReplace).toHaveBeenCalledWith('/login');

                // Cleanup
                unmount();
                clearCookie('jwt');
                fetchSpy.mockRestore();
            }),
            { numRuns: 100 },
        );
    });
});
