'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { CONFIG } from '@/lib/constants/config';
import { SSE_EVENTS } from '@/lib/constants/sse-events';

export function SseProvider({ children }: { children: ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const eventSourceRef = useRef<EventSource | null>(null);

    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;

    // O(1) event routing map
    // Maps Server-Sent Event names directly to handler functions avoiding switch blocks.
    const eventHandlers = useRef<Record<string, (payload: any) => void>>({
        [SSE_EVENTS.ADVISOR_USER_BALANCE_UPDATE]: (payload: { balance: number }) => {
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
                useAuthStore.getState().setUser({
                    ...currentUser,
                    balance: payload.balance,
                });
            }
        },
        // We can confidently map future SSE_EVENTS here (e.g. notifications)
    });

    useEffect(() => {
        // Only connect if the user is authenticated.
        if (!isAuthenticated) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            retryCountRef.current = 0;
            return;
        }

        function connect() {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            // By passing withCredentials: true, the browser automatically attaches the
            // HTTP-only 'access_token' cookie which the backend JwtStrategy validates.
            const url = `${CONFIG.apiUrl}/users/stream`;
            const eventSource = new EventSource(url, { withCredentials: true });
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('[SSE] Connected to user stream');
                retryCountRef.current = 0; // Reset retries on successful connection
            };

            eventSource.onerror = () => {
                // Close the native EventSource to stop its internal uncontrolled retry loop
                eventSource.close();
                eventSourceRef.current = null;

                if (retryCountRef.current >= MAX_RETRIES) {
                    console.warn('[SSE] Max retries reached. Stopping reconnection attempts.');
                    return;
                }

                // Exponential backoff: 1s, 2s, 4s, 8s, 16s... max 30s
                const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000);
                retryCountRef.current += 1;

                console.warn(`[SSE] Connection dropped. Retrying ${retryCountRef.current}/${MAX_RETRIES} in ${delay}ms...`);

                retryTimeoutRef.current = setTimeout(() => {
                    connect();
                }, delay);
            };

            // Dynamically iterate our registry and attach O(1) specific event listeners
            Object.keys(eventHandlers.current).forEach((eventName) => {
                eventSource.addEventListener(eventName, (e: MessageEvent) => {
                    try {
                        const payload = JSON.parse(e.data);
                        eventHandlers.current[eventName]?.(payload);
                    } catch (error) {
                        console.error(`[SSE] Failed to parse payload for event ${eventName}`, error);
                    }
                });
            });
        }

        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            console.log('[SSE] Disconnected from user stream');
        };
    }, [isAuthenticated]);

    // We are a logical provider, no context payload required for now.
    return <>{children}</>;
}
