import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSSESync } from './useSSESync';

describe('useSSESync', () => {
    let mockEventSource: {
        close: ReturnType<typeof vi.fn>;
        onmessage: ((event: MessageEvent) => void) | null;
        onerror: (() => void) | null;
    };

    let EventSourceConstructor: any;

    beforeEach(() => {
        // Mock EventSource instance
        mockEventSource = {
            close: vi.fn(),
            onmessage: null,
            onerror: null,
        };

        // Create a constructor function that returns the mock
        EventSourceConstructor = vi.fn(function (this: any) {
            return mockEventSource;
        });

        // Replace global EventSource
        // @ts-ignore
        global.EventSource = EventSourceConstructor;

        // Mock document.cookie
        Object.defineProperty(document, 'cookie', {
            writable: true,
            configurable: true,
            value: 'token=test-jwt-token',
        });

        // Mock process.env
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';

        // Use fake timers
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should create EventSource with correct URL and token', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        expect(EventSourceConstructor).toHaveBeenCalledWith(
            'http://localhost:8080/api/sse?token=test-jwt-token'
        );
    });

    it('should not create EventSource when token is missing', () => {
        Object.defineProperty(document, 'cookie', {
            writable: true,
            configurable: true,
            value: '',
        });

        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        expect(EventSourceConstructor).not.toHaveBeenCalled();
    });

    it('should not create EventSource when enabled is false', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync, false));

        expect(EventSourceConstructor).not.toHaveBeenCalled();
    });

    it('should call onSync when valid JSON message is received', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        const event = {
            data: JSON.stringify({
                event: 'connected',
                clientId: 'test-client-id',
            }),
        } as MessageEvent;

        // Simulate message event
        mockEventSource.onmessage?.(event);

        expect(onSync).toHaveBeenCalledWith({
            event: 'connected',
            clientId: 'test-client-id',
        });
    });

    it('should call onSync when sync event is received', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        const event = {
            data: JSON.stringify({
                event: 'sync',
                worksheet: 'Inbound',
                id: 42,
            }),
        } as MessageEvent;

        mockEventSource.onmessage?.(event);

        expect(onSync).toHaveBeenCalledWith({
            event: 'sync',
            worksheet: 'Inbound',
            id: 42,
        });
    });

    it('should ignore invalid JSON messages', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        const event = {
            data: 'invalid json',
        } as MessageEvent;

        mockEventSource.onmessage?.(event);

        expect(onSync).not.toHaveBeenCalled();
    });

    it('should close EventSource on error and reconnect after 5 seconds', () => {
        const onSync = vi.fn();
        renderHook(() => useSSESync(onSync));

        // Trigger error
        mockEventSource.onerror?.();

        expect(mockEventSource.close).toHaveBeenCalled();

        // Fast-forward 4 seconds (should not reconnect yet)
        vi.advanceTimersByTime(4000);
        expect(EventSourceConstructor).toHaveBeenCalledTimes(1);

        // Fast-forward to 5 seconds (should reconnect now)
        vi.advanceTimersByTime(1000);
        expect(EventSourceConstructor).toHaveBeenCalledTimes(2);
    });

    it('should close EventSource on unmount', () => {
        const onSync = vi.fn();
        const { unmount } = renderHook(() => useSSESync(onSync));

        expect(mockEventSource.close).not.toHaveBeenCalled();

        unmount();

        expect(mockEventSource.close).toHaveBeenCalled();
    });

    it('should use latest onSync callback without re-subscribing', () => {
        const onSync1 = vi.fn();
        const onSync2 = vi.fn();

        const { rerender } = renderHook(
            ({ handler }) => useSSESync(handler),
            { initialProps: { handler: onSync1 } }
        );

        // Send message with first handler
        const event1 = {
            data: JSON.stringify({ event: 'connected', clientId: 'test-1' }),
        } as MessageEvent;

        mockEventSource.onmessage?.(event1);

        expect(onSync1).toHaveBeenCalledWith({
            event: 'connected',
            clientId: 'test-1',
        });
        expect(onSync2).not.toHaveBeenCalled();

        // Update handler
        rerender({ handler: onSync2 });

        // Send message with second handler
        const event2 = {
            data: JSON.stringify({ event: 'sync', worksheet: 'Outbound', id: 10 }),
        } as MessageEvent;

        mockEventSource.onmessage?.(event2);

        expect(onSync2).toHaveBeenCalledWith({
            event: 'sync',
            worksheet: 'Outbound',
            id: 10,
        });

        // First handler should still only have been called once
        expect(onSync1).toHaveBeenCalledTimes(1);
    });
});
