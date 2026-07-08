// 1. IMPORTS
/* eslint-disable import/no-unresolved */
// @ts-ignore - socket.io-client will be installed via bun install
import { io, Socket } from 'socket.io-client';
import { baseUrl } from 'api/axios/config';
import ZustandPersist from 'zustand/persist';

// 2. VARIABLES & TYPES
// Strip /api/v1 suffix — WebSocket connects at root
const getSocketUrl = () => baseUrl.value.replace('/api/v1', '');

let socket: Socket | null = null;

// 3. FUNCTIONS
export const getSocket = (): Socket => {
  if (socket?.connected) return socket;

  const token = ZustandPersist.getState().accessToken;
  const url = getSocketUrl();

  socket = io(url, {
    transports: ['websocket'],
    auth: { token: token ? `Bearer ${token}` : '' },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.debug('[Socket] Connected');
  });

  socket.on('disconnect', () => {
    console.debug('[Socket] Disconnected');
  });

  socket.on('connect_error', (err: Error) => {
    console.debug('[Socket] connect_error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};
