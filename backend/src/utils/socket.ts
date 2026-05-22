import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

// Map to keep track of connected users: { userId: socketId }
const connectedUsers = new Map<string, string>();

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust this in production
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const secret = process.env.JWT_SECRET || 'hanga_works_jwt_secret_super_secure_key_2026';
      const decoded = jwt.verify(token as string, secret) as { id: string | number };
      
      // Attach user ID to the socket
      (socket as any).userId = decoded.id.toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    
    // Map the user ID to the socket ID
    connectedUsers.set(userId, socket.id);
    console.log(`[Socket.IO] User ${userId} connected with socket ${socket.id}`);

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`[Socket.IO] User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Emits an event to a specific connected user.
 * @param userId The ID of the user to send the notification to.
 * @param event The name of the event (e.g., 'notification').
 * @param data The payload.
 */
export const emitToUser = (userId: string | number, event: string, data: any) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    return true;
  }
  // User is not currently connected
  return false;
};
