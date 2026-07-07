/* eslint-disable import/no-unresolved */
// @ts-ignore - socket.io-client will be installed manually
import { io, Socket } from 'socket.io-client';
import { baseUrl } from 'api/axios/config';
import ZustandPersist from 'zustand/persist';

// Strip /api/v1 suffix — WebSocket connects at root
const getSocketUrl = () => baseUrl.value.replace('/api/v1', '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket?.connected) return socket;

  const token = ZustandPersist.getState().accessToken;
  const url = getSocketUrl();

  socket = io(url, {
    transports: ['websocket'],
    auth: { token: token ? `Bearer ${token}` : '' },
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    timeout: 5000,
  });

  socket.on('connect_error', (err: Error) => {
    console.warn('[Socket] connect_error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
