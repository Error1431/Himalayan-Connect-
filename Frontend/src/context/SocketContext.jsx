import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../utils/api';

const SocketContext = createContext(null);

// One socket connection for the whole app — used for chat messages,
// call signaling, and online/offline presence (the green/red dot).
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setOnlineUserIds(new Set());
      setConnected(false);
      return;
    }

    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-user-room', userId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('online-users', (ids) => {
      setOnlineUserIds(new Set(ids));
    });

    socket.on('presence-update', ({ userId: id, online }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(id); else next.delete(id);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, user?._id]);

  const isOnline = useCallback((id) => onlineUserIds.has(String(id)), [onlineUserIds]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketRef, onlineUserIds, isOnline, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}
