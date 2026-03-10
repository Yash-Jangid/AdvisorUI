'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { CONFIG } from '@/lib/constants/config';
import { useAuthStore } from '@/lib/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leaderboardKeys } from '@/lib/api/hooks/useLeaderboard';
import type { LeaderboardEntry } from '@/lib/api/types';

// ─── Context ──────────────────────────────────────────────────────────────────

interface SocketContextValue {
  socket: Socket | null;
  joinMatchRoom: (matchId: string) => void;
  leaveMatchRoom: (matchId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  joinMatchRoom: () => undefined,
  leaveMatchRoom: () => undefined,
});

export const useSocket = () => useContext(SocketContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to Socket.IO with cookie-based JWT auth
    socketRef.current = io(CONFIG.wsUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const socket = socketRef.current;

    // ── Leaderboard real-time updates ───────────────────────────────────────
    // ── Leaderboard real-time updates ───────────────────────────────────────
    socket.on('leaderboard:update', (entries: LeaderboardEntry[]) => {
      qc.setQueryData(leaderboardKeys.top(50), entries);
    });

    // ── Access Control real-time enforcement ────────────────────────────────
    socket.on(
      'user:access-updated',
      (payload: {
        isActive?: boolean;
        isBettingDisabled?: boolean;
        isUserCreationDisabled?: boolean;
      }) => {
        // Core account deactivation overrides everything else — boot user completely.
        if (payload.isActive === false) {
          useAuthStore.getState().clearAuth();
          toast.error('Your session has been terminated by an administrator.');
          window.location.href = '/login';
          return;
        }

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            ...payload,
          });

          if (
            payload.isBettingDisabled !== undefined ||
            payload.isUserCreationDisabled !== undefined
          ) {
            toast.info('Your access permissions were updated by an administrator.', {
              id: 'access-update', // prevent spam
            });
          }
        }
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, qc]);

  const joinMatchRoom = (matchId: string) => {
    socketRef.current?.emit('subscribe:match', matchId);
  };

  const leaveMatchRoom = (matchId: string) => {
    socketRef.current?.emit('unsubscribe:match', matchId);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinMatchRoom, leaveMatchRoom }}>
      {children}
    </SocketContext.Provider>
  );
}
