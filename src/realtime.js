// src/realtime.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export function initIO(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }
  });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch (e) {
      next(e);
    }
  });
  io.on('connection', (socket) => {
    const userId = String(socket.user.id);
    socket.join(userId);
  });
}
