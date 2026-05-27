import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected via Socket.io: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // --- AUTH MODULE HOOKS ---
  emitUserLoggedIn(userId: string) {
    this.server.emit('auth-event', { message: `User ${userId} just logged in!` });
  }

  // --- TEAMMATE HOOKS (LMS / JOBS) ---
  emitJobMatch(userId: string, jobData: Record<string, unknown>) {
    this.server.emit(`job-match-${userId}`, jobData);
  }

  emitApplicationStatus(userId: string, statusData: Record<string, unknown>) {
    this.server.emit(`application-status-${userId}`, statusData);
  }

  emitCourseComplete(userId: string, courseData: Record<string, unknown>) {
    this.server.emit(`course-complete-${userId}`, courseData);
  }

  emitCertIssued(userId: string, certData: Record<string, unknown>) {
    this.server.emit(`cert-issued-${userId}`, certData);
  }
}
