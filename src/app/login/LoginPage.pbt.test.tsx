// Feature: authentication-system, Property 7: Client-side form rejects blank fields

/**
 * Validates: Requirements 6.2, 6.3
 *
 * For any submission of the login form where either the email field or the
 * password field is empty (including whitespace-only strings), the frontend
 * SHALL NOT dispatch a network request to the backend.
 *
 * Minimum 100 runs with fast-check.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, within, act } from '@testing-library/react';
import * as fc from 'fast-check';
import LoginPage from './page';
import { UserProvider } from '@/contexts/UserContext';

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
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Render LoginPage in UserProvider and return scoped DOM queries.
 * Scoping to `container` prevents cross-iteration interference.
 */
function renderLoginPage() {
    const result = render(
        <UserProvider>
            <LoginPage />
        </UserProvider>,
    );
    const scoped = within(result.container);
    return {
        emailInput: scoped.getByPlaceholderText('Enter email') as HTMLInputElement,
        passwordInput: scoped.getByPlaceholderText('Enter password') as HTMLInputElement,
        submitButton: scoped.getByRole('button', { name: /^login$/i }),
        unmount: result.unmount,
    };
}

/**
 * Set the value of a controlled React input and trigger the change event.
 * Using fireEvent directly is much faster than userEvent for PBT iterations.
 */
function fillInput(input: HTMLElement, value: string) {
    fireEvent.change(input, { target: { value } });
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

/** Blank (empty or whitespace-only) strings */
const blankStringArb = fc.constantFrom('', ' ', '   ', '\t', '\n', '  \t  ', '\n\n');

/** Non-blank email */
const validEmailArb = fc.emailAddress();

/** Non-blank password — at least one visible character */
const validPasswordArb = fc.stringMatching(/^[a-zA-Z0-9!@#$%^&*]{1,32}$/);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginPage PBT — Property 7: Client-side form rejects blank fields', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({}), { status: 200, statusText: 'OK' }),
        );
    });

    afterEach(() => {
        cleanup();
        fetchSpy.mockRestore();
        vi.restoreAllMocks();
    });

    // ── Scenario A: blank email + blank password ───────────────────────────────

    it(
        'Property 7a — blank email + blank password → fetch is never called',
        async () => {
            await fc.assert(
                fc.asyncProperty(blankStringArb, blankStringArb, async (blankEmail, blankPassword) => {
                    fetchSpy.mockClear();

                    const { emailInput, passwordInput, submitButton, unmount } = renderLoginPage();

                    act(() => {
                        fillInput(emailInput, blankEmail);
                        fillInput(passwordInput, blankPassword);
                        fireEvent.submit(submitButton.closest('form')!);
                    });

                    expect(fetchSpy).not.toHaveBeenCalled();
                    unmount();
                }),
                { numRuns: 50 },
            );
        },
        60_000,
    );

    // ── Scenario B: blank email + valid password ───────────────────────────────

    it(
        'Property 7b — blank email + valid password → fetch is never called',
        async () => {
            await fc.assert(
                fc.asyncProperty(blankStringArb, validPasswordArb, async (blankEmail, validPassword) => {
                    fetchSpy.mockClear();

                    const { emailInput, passwordInput, submitButton, unmount } = renderLoginPage();

                    act(() => {
                        fillInput(emailInput, blankEmail);
                        fillInput(passwordInput, validPassword);
                        fireEvent.submit(submitButton.closest('form')!);
                    });

                    expect(fetchSpy).not.toHaveBeenCalled();
                    unmount();
                }),
                { numRuns: 50 },
            );
        },
        60_000,
    );

    // ── Scenario C: valid email + blank password ───────────────────────────────

    it(
        'Property 7c — valid email + blank password → fetch is never called',
        async () => {
            await fc.assert(
                fc.asyncProperty(validEmailArb, blankStringArb, async (validEmail, blankPassword) => {
                    fetchSpy.mockClear();

                    const { emailInput, passwordInput, submitButton, unmount } = renderLoginPage();

                    act(() => {
                        fillInput(emailInput, validEmail);
                        fillInput(passwordInput, blankPassword);
                        fireEvent.submit(submitButton.closest('form')!);
                    });

                    expect(fetchSpy).not.toHaveBeenCalled();
                    unmount();
                }),
                { numRuns: 50 },
            );
        },
        60_000,
    );
});
