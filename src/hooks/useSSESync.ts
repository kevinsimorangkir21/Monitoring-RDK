'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Interface untuk event SSE yang diterima dari backend
 */
interface SSEEvent {
    event: 'connected' | 'sync';
    worksheet?: string;
    id?: number;
    clientId?: string;
}

/**
 * Handler function yang dipanggil ketika event SSE diterima
 */
type SyncHandler = (event: SSEEvent) => void;

/**
 * useSSESync — Custom hook untuk menghubungkan ke SSE endpoint backend
 * dan menerima update real-time dari sinkronisasi Google Sheets.
 *
 * Hook ini:
 * - Membaca JWT token dari cookie
 * - Membuat koneksi EventSource ke /api/sse dengan token sebagai query param
 * - Menangani event onmessage dan mem-parse JSON
 * - Memanggil callback onSync via ref untuk menghindari stale closure
 * - Menangani reconnection otomatis setelah error (5 detik delay)
 * - Cleanup koneksi saat komponen unmount
 *
 * @param onSync  - Callback yang dipanggil setiap kali event SSE diterima
 * @param enabled - Set false untuk disable koneksi (default: true)
 *
 * @example
 * ```tsx
 * function InboundTable() {
 *   const { refetch } = useInbounds();
 *
 *   useSSESync((evt) => {
 *     if (evt.event === 'sync' && evt.worksheet === 'Inbound') {
 *       refetch(); // re-query data dari backend
 *     }
 *   });
 *
 *   return <table>...</table>;
 * }
 * ```
 */
export function useSSESync(onSync: SyncHandler, enabled = true): void {
    const esRef = useRef<EventSource | null>(null);
    const onSyncRef = useRef<SyncHandler>(onSync);

    // Selalu gunakan versi terbaru dari callback tanpa perlu re-subscribe
    useEffect(() => {
        onSyncRef.current = onSync;
    });

    const connect = useCallback(() => {
        // Ambil JWT token dari cookie
        const token = typeof window !== 'undefined'
            ? document.cookie.match(/token=([^;]+)/)?.[1]
            : null;

        if (!token) {
            // Jika tidak ada token, tidak bisa connect
            return;
        }

        // EventSource tidak support custom header Authorization,
        // jadi kirim token via query parameter
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const url = `${apiUrl}/sse?token=${encodeURIComponent(token)}`;

        const es = new EventSource(url);
        esRef.current = es;

        // Handle incoming messages
        es.onmessage = (e) => {
            try {
                const parsed: SSEEvent = JSON.parse(e.data);
                // Panggil handler via ref untuk menghindari stale closure
                onSyncRef.current(parsed);
            } catch {
                // Abaikan pesan yang tidak valid JSON
                // (misalnya keepalive comment dari backend)
            }
        };

        // Handle error dan reconnection
        es.onerror = () => {
            es.close();
            esRef.current = null;

            // Reconnect setelah 5 detik jika masih enabled
            setTimeout(() => {
                if (enabled) {
                    connect();
                }
            }, 5000);
        };
    }, [enabled]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        connect();

        // Cleanup: tutup EventSource saat komponen unmount
        return () => {
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
        };
    }, [enabled, connect]);
}
